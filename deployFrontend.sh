rm -f build/contracts/*
rsync -r src/ docs/
rsync -r build/contracts/ChainList.json docs/
git add .
git commit -m "deploy frontend"
git push

