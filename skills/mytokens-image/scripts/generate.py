#!/usr/bin/env python3
"""Generate or edit an image via mytokens gpt-image-2 and save to a PNG file.

Text-to-image (default):
  python3 generate.py --prompt "..." [--out out.png] [--size 1024x1536] \
    [--quality low] [--n 1] [--model gpt-image-2]

Image-to-image / edit (multipart via /v1/images/edits):
  python3 generate.py --prompt "edit instruction" --image /path/in.png \
    [--out out.png] [--size 1024x1536] [--quality low]

Reads API key from env var MYTOKENS_API_KEY. Base URL from MYTOKENS_BASE_URL
(default https://api.mytokens.vip). Set a long socket timeout (image gen ~40s,
retries may push beyond that). Prints JSON summary to stdout on success.
"""
import argparse
import base64
import json
import mimetypes
import os
import sys
import urllib.error
import urllib.request

import ssl


def _multipart(fields, files):
    boundary = "----mytokens" + os.urandom(16).hex()
    parts = []
    for k, v in fields.items():
        parts.append(
            f"--{boundary}\r\nContent-Disposition: form-data; name=\"{k}\"\r\n\r\n{v}\r\n".encode()
        )
    for k, (name, data, ctype) in files.items():
        parts.append(
            f"--{boundary}\r\nContent-Disposition: form-data; name=\"{k}\"; "
            f"filename=\"{name}\"\r\nContent-Type: {ctype}\r\n\r\n".encode()
        )
        parts.append(data)
        parts.append(b"\r\n")
    parts.append(f"--{boundary}--\r\n".encode())
    return b"".join(parts), boundary


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--prompt", required=True)
    ap.add_argument("--image", default=None, help="input image path for image-to-image editing")
    ap.add_argument("--out", default="output.png")
    ap.add_argument("--size", default="1024x1536")
    ap.add_argument("--quality", default=None, help="low/medium/high; gateway does not validate")
    ap.add_argument("--n", type=int, default=1)
    ap.add_argument("--model", default="gpt-image-2")
    ap.add_argument("--output-format", default=None, help="png/jpeg/webp; gateway may ignore")
    ap.add_argument("--timeout", type=float, default=300.0)
    ap.add_argument("--verbose", action="store_true")
    args = ap.parse_args()

    key = os.environ.get("MYTOKENS_API_KEY")
    if not key:
        sys.exit("ERROR: MYTOKENS_API_KEY env var is not set")
    base = os.environ.get("MYTOKENS_BASE_URL", "https://api.mytokens.vip").rstrip("/")
    ctx = ssl.create_default_context()

    if args.image:
        url = f"{base}/v1/images/edits"
        fields = {
            "model": args.model,
            "prompt": args.prompt,
            "size": args.size,
            "n": str(args.n),
        }
        if args.quality:
            fields["quality"] = args.quality
        if args.output_format:
            fields["output_format"] = args.output_format
        with open(args.image, "rb") as f:
            img_data = f.read()
        ctype = mimetypes.guess_type(args.image)[0] or "image/png"
        body, boundary = _multipart(fields, {
            "image": (os.path.basename(args.image), img_data, ctype),
        })
        headers = {
            "Authorization": f"Bearer {key}",
            "Content-Type": f"multipart/form-data; boundary={boundary}",
        }
        if args.verbose:
            print(f"POST {url} (edits) size={args.size} model={args.model}", file=sys.stderr)
    else:
        url = f"{base}/v1/images/generations"
        body_obj = {
            "model": args.model,
            "prompt": args.prompt,
            "size": args.size,
            "n": args.n,
        }
        if args.quality:
            body_obj["quality"] = args.quality
        if args.output_format:
            body_obj["output_format"] = args.output_format
        body = json.dumps(body_obj).encode()
        headers = {
            "Authorization": f"Bearer {key}",
            "Content-Type": "application/json",
        }
        if args.verbose:
            print(f"POST {url} (generations) size={args.size} model={args.model} n={args.n}", file=sys.stderr)

    req = urllib.request.Request(url, data=body, headers=headers, method="POST")
    try:
        with urllib.request.urlopen(req, timeout=args.timeout, context=ctx) as resp:
            raw = resp.read()
    except urllib.error.HTTPError as e:
        detail = e.read().decode(errors="replace")
        sys.exit(f"HTTP {e.code}: {detail}")
    except Exception as e:
        sys.exit(f"Request failed: {e}")

    data = json.loads(raw)
    if "error" in data:
        sys.exit(f"API error: {data['error']}")

    items = data.get("data", [])
    if not items:
        sys.exit("No images in response")
    if args.n == 1:
        item = items[0]
        img = base64.b64decode(item["b64_json"])
        with open(args.out, "wb") as f:
            f.write(img)
        print(json.dumps({
            "ok": True,
            "output": args.out,
            "bytes": len(img),
            "revised_prompt": item.get("revised_prompt", ""),
            "response_fields": sorted(item.keys()),
        }, ensure_ascii=False))
    else:
        outs = []
        for i, item in enumerate(items):
            img = base64.b64decode(item["b64_json"])
            path = args.out.replace(".png", f"_{i + 1}.png") if args.out.endswith(".png") else f"{args.out}_{i + 1}.png"
            with open(path, "wb") as f:
                f.write(img)
            outs.append(path)
        print(json.dumps({"ok": True, "outputs": outs}, ensure_ascii=False))


if __name__ == "__main__":
    main()
