
src = os.path.expanduser('~/zen/QuietText 2.0/QuietText')
dst = os.path.expanduser('~/zen/QuietText 2.0/extension')

if os.path.exists(dst):
    shutil.rmtree(dst)

for f in ['content.css', 'content.js', 'groq.js', 'metrics.js', 'storage.js', 'chart.umd.min.js']:
for folder in ['fonts', 'icons']:
    shutil.copytree(os.path.join(src, folder), os.path.join(dst, folder))
