from sqlalchemy.orm import Session
from repositories.sale_repository import SaleRepository
from datetime import datetime, timedelta
from dateutil.relativedelta import relativedelta
from utils.utils import ( getRangeIndex, range_summary, calc_variacion, group_daily_distinct_invoices)

class SaleService:

    @staticmethod
    def getDashboardSummary(db: Session):
        #current_date = date.today()
        current_date = datetime(2025, 3, 31)

        dashboard = {
            "current_quarter_range": "",
            "current_quarter_total_sales": "",
            "current_quarter_sale_rate": "",
            "current_quarter_total_invoices": "",
            "current_quarter_invoice_rate": "",
            "last_quarter_range": "",
            "last_quarter_total_sales": "",
            "last_quarter_sale_rate": "",
            "last_quarter_total_invoice": "",
            "last_quarter_invoice_rate": "",
            "sales": []
        }

        # Obtener rango actual
        anual_range_1 = getRangeIndex(current_date, "Trimestre") # Based on the current date
        print(f"{anual_range_1['index']} {anual_range_1['range']}, {anual_range_1['start_range']} → {anual_range_1['end_range']}")
        dashboard["current_quarter_range"] = f"{anual_range_1['range']} {anual_range_1['index']}, {anual_range_1['start_range']} → {anual_range_1['end_range']}"

        # Obtener rango pasado
        anual_range_2 = getRangeIndex( datetime.strptime(anual_range_1['start_range'], "%Y-%m-%d") - timedelta(days=1), "Trimestre")
        print(f"{anual_range_2['index']} {anual_range_2['range']}, {anual_range_2['start_range']} → {anual_range_2['end_range']}")
        dashboard["last_quarter_range"] = f"{anual_range_2['range']} {anual_range_2['index']}, {anual_range_2['start_range']} → {anual_range_2['end_range']}"

        # Obtener rango antepasado
        anual_range_3 = getRangeIndex( datetime.strptime(anual_range_2['start_range'], "%Y-%m-%d") - timedelta(days=1), "Trimestre")
        print(f"{anual_range_3['index']} {anual_range_3['range']}, {anual_range_3['start_range']} → {anual_range_3['end_range']}")

        ventas = SaleRepository.get_all_by_range(db, datetime.strptime(anual_range_3['start_range'], "%Y-%m-%d"), datetime.strptime(anual_range_1['end_range'], "%Y-%m-%d"))

        # Convertir strings de los rangos a datetime
        start_1 = datetime.strptime(anual_range_1['start_range'], "%Y-%m-%d")
        end_1   = datetime.strptime(anual_range_1['end_range'], "%Y-%m-%d")

        start_2 = datetime.strptime(anual_range_2['start_range'], "%Y-%m-%d")
        end_2   = datetime.strptime(anual_range_2['end_range'], "%Y-%m-%d")

        start_3 = datetime.strptime(anual_range_3['start_range'], "%Y-%m-%d")
        end_3   = datetime.strptime(anual_range_3['end_range'], "%Y-%m-%d")

        # Filtrar ventas para cada rango
        ventas_range_1 = [v for v in ventas if start_1 <= v.sale_date <= end_1]
        ventas_range_2 = [v for v in ventas if start_2 <= v.sale_date <= end_2]
        ventas_range_3 = [v for v in ventas if start_3 <= v.sale_date <= end_3]

        # Calcular resumen de cada rango
        r1_total, r1_facturas, r1_monto = range_summary(ventas_range_1)
        r2_total, r2_facturas, r2_monto = range_summary(ventas_range_2)
        r3_total, r3_facturas, r3_monto = range_summary(ventas_range_3)

        # Variaciones entre rangos
        var_facturas_r1_r2 = calc_variacion(r1_facturas, r2_facturas)
        var_facturas_r2_r3 = calc_variacion(r2_facturas, r3_facturas)

        var_monto_r1_r2 = calc_variacion(r1_monto, r2_monto)
        var_monto_r2_r3 = calc_variacion(r2_monto, r3_monto)

        # Prints con formato
        print(f"Trimestre 1 ({start_1} → {end_1}) → Ventas: {r1_total}, Facturas únicas: {r1_facturas}, Monto total: {r1_monto:,.2f} | Δ Facturas: {var_facturas_r1_r2}%, Δ Monto: {var_monto_r1_r2}%")
        print(f"Trimestre 2 ({start_2} → {end_2}) → Ventas: {r2_total}, Facturas únicas: {r2_facturas}, Monto total: {r2_monto:,.2f} | Δ Facturas: {var_facturas_r2_r3}%, Δ Monto: {var_monto_r2_r3}%")
        print(f"Trimestre 3 ({start_3} → {end_3}) → Ventas: {r3_total}, Facturas únicas: {r3_facturas}, Monto total: {r3_monto:,.2f}")
        
        dashboard["current_quarter_total_sales"] = f"${r1_monto:,.2f}"
        dashboard["current_quarter_sale_rate"] = f"${var_monto_r1_r2:,.2f}"
        dashboard["current_quarter_total_invoices"] = f"{r1_facturas}"
        dashboard["current_quarter_invoice_rate"] = f"${var_facturas_r1_r2:,.2f}"

        dashboard["last_quarter_total_sales"] = f"${r2_monto:,.2f}"
        dashboard["last_quarter_sale_rate"] = f"${var_monto_r2_r3:,.2f}"
        dashboard["last_quarter_total_invoices"] = f"{r2_facturas}"
        dashboard["last_quarter_invoice_rate"] = f"${var_facturas_r2_r3:,.2f}"

        cur_start = current_date - relativedelta(months=3)
        cur_end   = current_date
        prev_start = current_date - relativedelta(years=1, months=3)
        prev_end   = current_date - relativedelta(years=1)

        ventas_current = SaleRepository.get_all_by_range(db, cur_start, cur_end)
        ventas_last = SaleRepository.get_all_by_range(db, prev_start, prev_end)

        map_curr = group_daily_distinct_invoices(ventas_current)
        map_last = group_daily_distinct_invoices(ventas_last)

        d = cur_start
        while d <= cur_end:
            key = (d.month, d.day)
            dashboard["sales"].append({
                "date": d.strftime("%Y-%m-%d"),
                "current_year": len(map_curr.get(key, set())),
                "last_year":    len(map_last.get(key, set()))
            })
            d += timedelta(days=1)

        for row in dashboard["sales"][:50]:
            print(row)

        return dashboard

