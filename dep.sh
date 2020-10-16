git add .
git commit -m "commit"
git push origin master

ssh cwid /bin/sh <<\EOF  
cd ~/public_html/gra/
git pull origin master
EOF 