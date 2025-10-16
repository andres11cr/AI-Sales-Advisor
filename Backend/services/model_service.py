import os, json
import pandas as pd
import numpy as np
import tensorflow as tf
import operator

from sqlalchemy.orm import Session
from repositories.sale_repository import SaleRepository
from models.Scaler import Scaler

from tensorflow.keras import layers, models, callbacks, optimizers
from tensorflow.keras.models import load_model
from datetime import timedelta
from functools import reduce

class ModelService:

    @staticmethod
    def build_models(db: Session):
        LOOKBACK = 60
        VAL_DAYS = 90
        BATCH_SIZE = 64
        EPOCHS = 25
        LEARNING_RATE = 1e-3

        OUT_DIR = "./data/models"
        SCALER_DIR = os.path.join(OUT_DIR, "scalers")
        for d in [OUT_DIR, SCALER_DIR]:
            os.makedirs(d, exist_ok=True)

        # Load data from PostgreSQL
        dataset = ModelService.load_data(db)
        print(dataset.info())

        # Filtrar solo P001 y P002
        dataset = dataset[dataset['product_code'].isin(['P001', 'P002'])].copy()
        products = sorted(dataset["product_code"].unique())
        print(f"Productos encontrados: {products}")
        
        result = {
            "metricas": [],
            "summary": []
        }

        for product in products:
            series = ModelService.build_daily_series(dataset, product)
            if len(series) >= LOOKBACK+VAL_DAYS:
                metrics = ModelService.train_product(series,product, LOOKBACK, VAL_DAYS, EPOCHS, BATCH_SIZE, OUT_DIR, SCALER_DIR, LEARNING_RATE)
                result["metricas"].append({product: metrics})
            else:
                print(f"[SKIP] {product}, insuficiente longitud")

        result["summary"] = ModelService.load_summary_metrics(result["metricas"])

        return result
     
    @staticmethod
    def predict(db: Session):
        LOOKBACK = 60
        VAL_DAYS = 90
        HORIZON = 90
        HISTORY_PLOT_DAYS = 365
        MODELS = ["MLP", "CNN1D", "LSTM", "CNN_LSTM"]

        OUT_DIR = "./data/models"
        SCALERS_DIR = os.path.join(OUT_DIR, "scalers")

        # Load data
        dataset = ModelService.load_data(db)
        # Filtrar P001 y P002 (ajusta si quieres más)
        dataset = dataset[dataset['product_code'].isin(['P001'])].copy()
        products = sorted(dataset["product_code"].unique())

        output = []  # ← lista final: una “row” por producto

        for product in products:
            series = ModelService.build_daily_series(dataset, product)
            if len(series) < LOOKBACK + VAL_DAYS + 5:
                continue

            # scaler
            scaler = ModelService.load_scaler(product, SCALERS_DIR)
            if scaler is None:
                arr_tmp = series.values.astype(np.float32)
                scaler = Scaler(np.mean(arr_tmp), np.std(arr_tmp))

            # datos escalados
            arr = series.values.astype(np.float32)
            arr_z = scaler.transform(arr)

            # ventana final
            last_window = arr_z[-LOOKBACK:].astype(np.float32)
            last_date = series.index.max()

            # histórico a graficar
            hist_start = max(series.index.min(), last_date - timedelta(days=HISTORY_PLOT_DAYS - 1))
            hist_dates = pd.date_range(hist_start, last_date, freq="D")
            hist_values = series.loc[hist_dates].values

            # contenedor por producto
            product_row = {
                "product_code": product,
                "models": {}  # se llenará por arquitectura
            }

            for arch in MODELS:
                model = ModelService.load_arch_model(arch, product, OUT_DIR)
                if model is None:
                    continue

                # decidir modo (iterativo vs directo) según dimensión de salida
                out_shape = model.output_shape
                out_dim = 1
                if isinstance(out_shape, tuple):
                    out_dim = 1 if len(out_shape) < 2 else int(reduce(operator.mul, out_shape[1:]))

                if out_dim == 1:
                    preds_z = ModelService.iterative_forecast(model, arch, last_window, HORIZON)
                else:
                    preds_z = ModelService.direct_forecast(model, arch, last_window, HORIZON)

                # incertidumbre a partir de residuales de validación (en z)
                sigma = ModelService.residual_std_for_arch(model, arch, arr_z, LOOKBACK, VAL_DAYS)
                lower_z = preds_z - 1.96 * sigma
                upper_z = preds_z + 1.96 * sigma

                # back-transform
                preds = scaler.inverse_transform(preds_z)
                lower = scaler.inverse_transform(lower_z)
                upper = scaler.inverse_transform(upper_z)

                # fechas de forecast
                fcst_idx = pd.date_range(last_date + timedelta(days=1), periods=HORIZON, freq="D")

                start_val = len(arr_z) - VAL_DAYS
                window = arr_z[start_val - LOOKBACK : start_val].astype(np.float32).copy()

                y_true_val_z = []
                y_pred_val_z = []


                for t in range(start_val, len(arr_z)):
                    # x_in: ventana actual
                    x_in = window.astype(np.float32)
                    # predicción one-step en espacio z
                    yhat_z = ModelService.one_step_predict(model, arch, x_in)
                    # yhat_z debe ser escalar; si viene array, toma escalar
                    if hasattr(yhat_z, "shape"):
                        yhat_z = float(np.squeeze(yhat_z))
                    else:
                        yhat_z = float(yhat_z)

                    y_pred_val_z.append(yhat_z)
                    y_true_val_z.append(float(arr_z[t]))

                    # actualizar ventana: drop first, append "verdadero" (simula despliegue real)
                    window = np.concatenate([window[1:], np.array([arr_z[t]], dtype=np.float32)], axis=0)

                # a escala original
                y_true_val = scaler.inverse_transform(np.array(y_true_val_z, dtype=np.float32))
                y_pred_val = scaler.inverse_transform(np.array(y_pred_val_z, dtype=np.float32))

                err = y_pred_val - y_true_val
                mae = float(np.mean(np.abs(err)))
                mse = float(np.mean(err**2))
                rmse = float(np.sqrt(mse))
                mape = ModelService._safe_mape(y_true_val, y_pred_val)
                smape = ModelService._smape(y_true_val, y_pred_val)
                bias = float(np.mean(err))  # >0 sobre-pronóstico; <0 sub-pronóstico
                mae_pct_of_mean = float(mae / (np.mean(np.abs(y_true_val)) + 1e-8) * 100.0)

                # cobertura 95% en validación usando mismo sigma (PI en z → original)
                lower_val = scaler.inverse_transform(np.array(y_pred_val_z) - 1.96 * sigma)
                upper_val = scaler.inverse_transform(np.array(y_pred_val_z) + 1.96 * sigma)
                covered = np.logical_and(y_true_val >= lower_val, y_true_val <= upper_val)
                coverage_95 = float(np.mean(covered) * 100.0)

                # rating simple según MAPE (ajusta si quieres)
                if mape <= 10:
                    eval_label = "bueno"
                elif mape <= 20:
                    eval_label = "medio"
                else:
                    eval_label = "malo"

                metrics_val = {
                    "mae": mae,
                    "mse": mse,
                    "rmse": rmse,
                    "mape_pct": mape,
                    "smape_pct": smape,
                    "bias": bias,
                    "mae_pct_of_mean": mae_pct_of_mean,
                    "coverage_95_pct": coverage_95,
                    "eval": eval_label,
                    "n_val": int(VAL_DAYS),
                }

                total_pred = float(np.sum(preds))
                total_low  = float(np.sum(lower))
                total_up   = float(np.sum(upper))
                mean_daily = float(np.mean(preds))
                p50        = float(np.median(preds))

                charts = []

                

                # guardar todo serializable
                product_row["models"][arch] = {
                    "history": {
                        "dates": [d.strftime("%Y-%m-%d") for d in hist_dates.to_pydatetime().tolist()],
                        "values": [float(x) for x in hist_values.tolist()],
                    },
                    "forecast": {
                        "dates": [d.strftime("%Y-%m-%d") for d in fcst_idx.to_pydatetime().tolist()],
                        "pred":  [float(x) for x in preds.tolist()],
                        "lower": [float(x) for x in lower.tolist()],
                        "upper": [float(x) for x in upper.tolist()],
                    },
                    "summary": {
                        "total_pred": total_pred,
                        "total_low": total_low,
                        "total_up": total_up,
                        "mean_daily": mean_daily,
                        "median": p50,
                    },
                    "metrics": metrics_val
                }

            output.append(product_row)

        return output

    @staticmethod
    def load_data(db: Session):
        dataset = SaleRepository.get_all(db)

        df = pd.DataFrame([{
            "id": s.id,
            "product_code": s.product_code,
            "quantity": s.quantity,
            "sale_date": s.sale_date
        } for s in dataset])

        # 1. Normalizar la columna de fechas (solo parte de fecha, sin hora)
        df["sale_date"] = pd.to_datetime(df["sale_date"]).dt.normalize()
        df["quantity"] = pd.to_numeric(df["quantity"], errors="coerce").fillna(0.0)

        # 2. Agrupar por día y producto, sumando las ventas (cantidad)
        gp = (df.groupby([df["sale_date"], df["product_code"]], as_index=False)["quantity"].sum())

        # 3. Construir el calendario completo, lista de todas las fechas entre la mínima y máxima y lista de todos los productos únicos
        date_min, date_max = gp["sale_date"].min(), gp["sale_date"].max()
        all_dates = pd.date_range(date_min, date_max, freq="D")
        all_products = gp["product_code"].drop_duplicates().sort_values()

        full_idx = pd.MultiIndex.from_product(
            [all_dates, all_products],
            names=["sale_date", "product_code"]
        )

        # 4. Reindexar el dataframe original al calendario completo, rellena con 0 en los días sin ventas
        train_dataset = (gp.set_index(["sale_date", "product_code"])
            .reindex(full_idx)
            .fillna({"quantity": 0})
            .reset_index()
            .sort_values(["sale_date", "product_code"], kind="stable"))
        
        # 5. Resultado final: dataset completo fecha × producto con ventas (incluye ceros)
        train_dataset.rename(columns={"quantity": "quantity"}, inplace=True)
        print(train_dataset.head(10))   # primeras 10 filas
        print(train_dataset.tail(10))   # últimas 10 filas

        return train_dataset
    
    @staticmethod
    def build_daily_series(df, product):
        sub = df[df["product_code"] == product].copy()
        return sub.set_index("sale_date").sort_index()["quantity"].asfreq("D", fill_value=0.0)
    
    @staticmethod
    def train_product(series, product, LOOKBACK, VAL_DAYS, EPOCHS, BATCH_SIZE, OUT_DIR, SCALER_DIR, LEARNING_RATE):
        arr = series.values.astype(np.float32)

         # Fit scaler SOLO con TRAIN para evitar fuga de datos ---
        split_idx = len(arr) - VAL_DAYS
        if split_idx <= 0:
            print(f"[SKIP] {product}, VAL_DAYS demasiado grande")
            return
        
        train_slice = arr[:split_idx]
        scaler = Scaler(np.mean(train_slice), np.std(train_slice))

        # Transformar toda la serie con ese scaler
        arr_z = scaler.transform(arr)

        # Ventanas y split temporal
        X, y = ModelService.make_windows(arr_z, LOOKBACK)
        if len(y) <= VAL_DAYS:
            print(f"[SKIP] {product}, muy pocas muestras ({len(y)}) vs VAL_DAYS={VAL_DAYS}")
            return

        X_tr, X_va, y_tr, y_va = ModelService.time_split(X, y, VAL_DAYS)
        X_tr_seq, X_va_seq = X_tr[..., None], X_va[..., None]

        models_to_train = {
            "MLP": (ModelService.build_mlp(LOOKBACK, LEARNING_RATE), X_tr, X_va),
            "CNN1D": (ModelService.build_cnn1d(LOOKBACK, LEARNING_RATE), X_tr_seq, X_va_seq),
            "LSTM": (ModelService.build_lstm(LOOKBACK, LEARNING_RATE), X_tr_seq, X_va_seq),
            "CNN_LSTM": (ModelService.build_cnn_lstm(LOOKBACK, LEARNING_RATE), X_tr_seq, X_va_seq)
        }

        # Estructura de métricas
        metric = {
            "MLP": {"loss": [], "val_loss": []},
            "CNN1D": {"loss": [], "val_loss": []},
            "LSTM": {"loss": [], "val_loss": []},
            "CNN_LSTM": {"loss": [], "val_loss": []}
        }

        for name,(model,Xtr,Xva) in models_to_train.items():
            print(f"--- Entrenando {name} para {product} ---")
            history = model.fit(Xtr, y_tr, validation_data=(Xva,y_va),
                    epochs=EPOCHS, batch_size=BATCH_SIZE, verbose=0,
                    callbacks=[callbacks.EarlyStopping(patience=5, restore_best_weights=True)])
            
             # Guardar modelo
            out_arch = os.path.join(OUT_DIR, name); os.makedirs(out_arch, exist_ok=True)
            model.save(os.path.join(out_arch,f"{product}.keras"), include_optimizer=False)
            print(f"Guardado {name} -> {out_arch}/{product}.keras")

            # Guardar pérdidas en metric
            ModelService.get_model_metrics(name, history, metric)

        # Guardar scaler (entrenado SOLO con train)
        with open(os.path.join(SCALER_DIR,f"{product}.json"),"w") as f:
            json.dump(scaler.to_json(), f)

        return metric
    
    @staticmethod
    def make_windows(arr, lookback=30, horizon=90):
        """
        Genera ventanas multi-step:
        - X: (N, lookback) con los últimos 'lookback' valores
        - y: (N, horizon) con los siguientes 'horizon' valores
        """
        arr = np.asarray(arr, dtype=np.float32)
        max_i = len(arr) - lookback - horizon + 1
        if max_i <= 0:
            raise ValueError(
                f"Serie demasiado corta: len(arr)={len(arr)}; se requiere >= {lookback + horizon}"
            )
        X = [arr[i:i+lookback] for i in range(max_i)]
        y = [arr[i+lookback:i+lookback+horizon] for i in range(max_i)]
        return np.array(X, dtype=np.float32), np.array(y, dtype=np.float32)

    @staticmethod
    def time_split(X, y, val_len=90):
        """
        Split temporal por número de muestras (no días).
        Usa las últimas 'val_len' ventanas como validación.
        """
        if val_len <= 0 or val_len >= len(X):
            raise ValueError(f"val_len inválido: {val_len} (total muestras={len(X)})")
        return X[:-val_len], X[-val_len:], y[:-val_len], y[-val_len:]
    
    @staticmethod
    def build_mlp(input_len, LEARNING_RATE, horizon=90):
        """
        Entrada: (input_len,)
        Salida:  (horizon,)  -> ej. 90 días futuros
        """
        inp = layers.Input(shape=(input_len,))
        x = layers.Dense(128, activation="relu")(inp)
        x = layers.Dropout(0.2)(x)
        x = layers.Dense(64, activation="relu")(x)
        out = layers.Dense(horizon)(x)  # <-- multi-salida
        m = models.Model(inp, out, name="MLP")
        m.compile(optimizer=optimizers.Adam(LEARNING_RATE), loss="mse", metrics=["mae"])
        return m

    @staticmethod
    def build_cnn1d(input_len, LEARNING_RATE, horizon=90):
        """
        Entrada: (input_len, 1)
        Salida:  (horizon,)
        """
        inp = layers.Input(shape=(input_len, 1))
        x = layers.Conv1D(64, 3, padding="causal", activation="relu")(inp)
        x = layers.MaxPooling1D(2)(x)
        x = layers.Conv1D(64, 3, padding="causal", activation="relu")(x)
        x = layers.GlobalAveragePooling1D()(x)
        x = layers.Dropout(0.2)(x)
        out = layers.Dense(horizon)(x)  # <-- multi-salida
        m = models.Model(inp, out, name="CNN1D")
        m.compile(optimizer=optimizers.Adam(LEARNING_RATE), loss="mse", metrics=["mae"])
        return m

    @staticmethod
    def build_lstm(input_len, LEARNING_RATE, horizon=90):
        """
        Entrada: (input_len, 1)
        Salida:  (horizon,)
        """
        inp = layers.Input(shape=(input_len, 1))
        x = layers.LSTM(64, return_sequences=True)(inp)
        x = layers.LSTM(32)(x)
        x = layers.Dropout(0.2)(x)
        out = layers.Dense(horizon)(x)  # <-- multi-salida
        m = models.Model(inp, out, name="LSTM")
        m.compile(optimizer=optimizers.Adam(LEARNING_RATE), loss="mse", metrics=["mae"])
        return m

    @staticmethod
    def build_cnn_lstm(input_len, LEARNING_RATE, horizon=90):
        """
        Entrada: (input_len, 1)
        Salida:  (horizon,)
        """
        inp = layers.Input(shape=(input_len, 1))
        x = layers.Conv1D(64, 3, padding="causal", activation="relu")(inp)
        x = layers.MaxPooling1D(2)(x)
        x = layers.Conv1D(64, 3, padding="causal", activation="relu")(x)
        x = layers.LSTM(64)(x)
        x = layers.Dropout(0.2)(x)
        out = layers.Dense(horizon)(x)  # <-- multi-salida
        m = models.Model(inp, out, name="CNN_LSTM")
        m.compile(optimizer=optimizers.Adam(LEARNING_RATE), loss="mse", metrics=["mae"])
        return m
    
    @staticmethod
    def get_model_metrics(model_name, history, metric):

        # Extraer listas de pérdidas desde History
        loss_list = list(history.history.get("loss", []))
        val_loss_list = list(history.history.get("val_loss", []))

        # Guardar en el diccionario
        metric[model_name]["loss"] = loss_list
        metric[model_name]["val_loss"] = val_loss_list
            
        return metric
    
    @staticmethod
    def load_summary_metrics(metrics):
        summary = {}
        for prod_dict in metrics or []:
            for product_code, models_dict in prod_dict.items():
                summary[product_code] = {}

                for model_name, values in models_dict.items():
                    losses = values.get("loss", []) or []
                    vlosses = values.get("val_loss", []) or []

                    # Usamos el último val_loss para evaluar
                    last_vloss = round(vlosses[-1], 4) if vlosses else None
                    last_loss = round(losses[-1], 4) if losses else None

                    if last_vloss is None:
                        eval_label = "sin datos"
                        desc_1 = "Sin datos suficientes para evaluar."
                        desc_2 = ""
                    else:
                        if last_vloss < 0.80:
                            eval_label = "bueno"
                        elif last_vloss < 0.90:
                            eval_label = "medio"
                        else:
                            eval_label = "malo"

                        desc_1 = f"loss={last_loss}, val_loss={last_vloss}"
                        desc_2 = f"Desempeño {eval_label} considerando el último error de validación"

                    summary[product_code][model_name] = {
                        "last": {"loss": last_loss, "val_loss": last_vloss},
                        "desc_1": desc_1,
                        "desc_2": desc_2,
                        "eval": eval_label,
                    }
        return summary

    @staticmethod
    def load_arch_model(arch, product, MODELS_DIR):
        path = os.path.join(MODELS_DIR, arch, f"{product}.keras")
        if not os.path.exists(path):
            return None
        return load_model(path, compile=False)
    
    @staticmethod
    def one_step_predict(model, arch, x_window):
        import numpy as np
        # x_window: (lookback,) para MLP; (lookback,) para secuenciales (le añadimos canal)
        x_in = x_window[np.newaxis, ...]              # (1, lookback)
        if arch != "MLP" and x_in.ndim == 2:         # CNN/LSTM esperan (1, lookback, 1)
            x_in = x_in[..., None]

        yhat = model.predict(x_in, verbose=0)        # puede ser (1,1), (1,), (1,H), (H,), etc.
        yhat = np.asarray(yhat).ravel()              # -> (N,)
        if yhat.size == 0:
            raise ValueError("Predicción vacía")
        return float(yhat[0])
       
    @staticmethod
    def iterative_forecast(model, arch, last_window, horizon):
        import numpy as np
        x = last_window.astype("float32").copy()
        preds = []
        for _ in range(horizon):
            y1 = ModelService.one_step_predict(model, arch, x)  # escalar
            preds.append(y1)
            # deslizamiento de la ventana
            x = np.roll(x, -1)
            x[-1] = y1
        return np.array(preds, dtype="float32")

    @staticmethod
    def direct_forecast(model, arch, last_window, horizon):
        import numpy as np
        x_in = last_window[np.newaxis, ...]
        if arch != "MLP" and x_in.ndim == 2:
            x_in = x_in[..., None]
        yhat = model.predict(x_in, verbose=0)
        yhat = np.asarray(yhat).ravel()
        if yhat.size < horizon:
            # si el modelo devuelve más corto, ajusta al tamaño disponible
            horizon = yhat.size
        return yhat[:horizon].astype("float32")

    @staticmethod
    def residual_std_for_arch(model, arch, arr_scaled, LOOKBACK, VAL_DAYS):
        """
        Estima la desviación estándar de residuales en validación (VAL_DAYS)
        para construir una banda de incertidumbre simple (asumiendo homocedasticidad).
        """
        X, y = ModelService.make_windows(arr_scaled, LOOKBACK)
        if len(y) < VAL_DAYS + 10:
            # fallback si hay muy pocos datos
            split = int(len(y)*0.8)
            X_tr, X_va, y_tr, y_va = X[:split], X[split:], y[:split], y[split:]
        else:
            X_tr, X_va, y_tr, y_va = ModelService.time_split(X, y, VAL_DAYS)

        if arch == "MLP":
            yhat = model.predict(X_va, verbose=0)
        else:
            yhat = model.predict(X_va[..., None], verbose=0)

        resid = (y_va - yhat).reshape(-1)
        if len(resid) < 2:
            return 0.0
        return float(np.std(resid, ddof=1))
    
    @staticmethod
    def load_scaler(product, SCALERS_DIR):
        path = os.path.join(SCALERS_DIR, f"{product}.json")
        if not os.path.exists(path):
            return None
        with open(path, "r") as f:
            d = json.load(f)
        return Scaler(d["mean"], d["std"])
    
    @staticmethod
    def _safe_mape(y_true, y_pred, eps=1e-8):
        denom = np.maximum(np.abs(y_true), eps)
        return float(np.mean(np.abs((y_true - y_pred) / denom)) * 100.0)
    
    @staticmethod
    def _smape(y_true, y_pred, eps=1e-8):
        denom = np.maximum((np.abs(y_true) + np.abs(y_pred)) / 2.0, eps)
        return float(np.mean(np.abs(y_true - y_pred) / denom) * 100.0)
