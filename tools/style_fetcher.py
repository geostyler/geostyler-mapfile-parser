from pathlib import Path
import requests
from lxml import etree


parser = etree.XMLParser(remove_blank_text=True)

for mapfile in Path("../mapfiles").rglob("*.map"):
    r = requests.get(
        "https://wms.geo.admin.ch/",
        params={
            "SERVICE": "WMS",
            "VERSION": "1.0.0",
            "REQUEST": "GetStyles",
            "LAYERS": mapfile.stem,
        },
    )
    r.raise_for_status()

    if "application/vnd.ogc.sld+xml" in r.headers["Content-Type"]:
        root = etree.fromstring(r.text, parser)
        etree.indent(root, space="\t")
        mapfile.with_suffix(".sld").write_bytes(etree.tostring(root, pretty_print=True))
