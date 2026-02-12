import json
import os
import pkgutil
import importlib
import inspect

import prody

OUT = os.path.join(os.path.dirname(__file__), "..", "_static", "api_index.json")

SKIP_PREFIXES = (
    "prody.tests",   # <- prevents your exact crash
)

def iter_modules(pkg):
    prefix = pkg.__name__ + "."
    for m in pkgutil.walk_packages(pkg.__path__, prefix):
        name = m.name
        if name.startswith(SKIP_PREFIXES):
            continue
        yield name

def main():
    index = {}

    for modname in iter_modules(prody):
        try:
            mod = importlib.import_module(modname)
        except Exception:
            # ignore anything that can't be imported on RTD
            continue

        for name, obj in vars(mod).items():
            if name.startswith("_"):
                continue
            if inspect.isfunction(obj) and getattr(obj, "__module__", "") == modname:
                index.setdefault(name, f"{modname}.{name}")

    os.makedirs(os.path.dirname(OUT), exist_ok=True)
    with open(OUT, "w", encoding="utf-8") as f:
        json.dump(index, f, indent=2, sort_keys=True)

    print(f"Wrote {len(index)} functions to {OUT}")

if __name__ == "__main__":
    main()
