echo "Starting redis server."
sudo systemctl start docker
sudo docker run -p 6379:6379 -d redis:5

if [ ! -e ./media/mime.types ]
then
	echo "Creating mime.types symlink..."
    ln -s /etc/nginx/mime.types ./media
fi

#Starts nginx with a prefix path and a configuration file
sudo nginx -p ./ -c ./media/nginx.conf  

python3 manage.py runserver