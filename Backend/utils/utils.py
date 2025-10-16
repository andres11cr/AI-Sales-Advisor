from datetime import date

def getRangeIndex(d: date, range: str) -> int:
    month = d.month
    year =  d.year
    index = {}

    match range:
        case "Trimestre":
            if 1 <= month <= 3:
                index = {"range": "Trimestre", "index": 1, "start_range": f"{year}-01-01", "end_range": f"{year}-03-31"}
            elif 4 <= month <= 6:
                index = {"range": "Trimestre", "index": 2, "start_range": f"{year}-04-01", "end_range": f"{year}-06-30"}
            elif 7 <= month <= 9:
                index = {"range": "Trimestre", "index": 3, "start_range": f"{year}-07-01", "end_range": f"{year}-09-30"}
            else:
                index = {"range": "Trimestre", "index": 4, "start_range": f"{year}-10-01", "end_range": f"{year}-12-31"}

        case "cuatrimestre":
            if 1 <= month <= 4:
                index = {"range": "cuatrimestre", "index": 1, "start_range": f"{year}-01-01", "end_range": f"{year}-04-30"}
            elif 5 <= month <= 8:
                index = {"range": "cuatrimestre", "index": 2, "start_range": f"{year}-05-01", "end_range": f"{year}-08-31"}
            else:
               index = {"range": "cuatrimestre", "index": 3, "start_range": f"{year}-09-01", "end_range": f"{year}-12-31"}

        case "semestre":
            if 1 <= month <= 6:
                index = {"range": "semestre", "index": 1, "start_range": f"{year}-01-01", "end_range": f"{year}-06-30"}
            else:
                index = {"range": "semestre", "index": 2, "start_range": f"{year}-07-01", "end_range": f"{year}-12-31"}

    return index

def range_summary(ventas):
    total_registros = len(ventas)
    facturas_unicas = len({v.invoice_number for v in ventas})
    monto_total = sum(v.total for v in ventas)
    return total_registros, facturas_unicas, monto_total

# Función para % variación
def calc_variacion(actual, previo):
    return round(100 * (actual - previo) / previo, 2) if previo else None

def group_daily_distinct_invoices(ventas):
    """
    Agrupa por (mes,día) y acumula invoice_numbers únicos por fecha.
    Retorna dict {(month, day): set(invoice_numbers)}.
    """
    by_md = {}
    for v in ventas:
        d = v.sale_date
        key = (d.month, d.day)
        if key not in by_md:
            by_md[key] = set()
        by_md[key].add(v.invoice_number)
    return by_md

def build_daily_series(df, product):
    s = (df[df["product_code"] == product]
         .set_index("sale_date")
         .sort_index()["quantity"]
         .asfreq("D", fill_value=0.0))
    return s
