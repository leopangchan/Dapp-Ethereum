rsync -rf src/ docs/
rsync -rf build/contracts/ChainList.json docs/
git add .
git commit -m "deploy frontend"
git push

