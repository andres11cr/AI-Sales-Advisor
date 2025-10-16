class Scaler:
    def __init__(self, mean_, std_):
        self.mean_ = mean_
        self.std_ = std_
    def transform(self, x):
        return (x - self.mean_) / (self.std_ if self.std_ > 0 else 1.0)
    def inverse_transform(self, x):
        return x * (self.std_ if self.std_ > 0 else 1.0) + self.mean_
    def to_json(self):
        return {"mean": float(self.mean_), "std": float(self.std_)}