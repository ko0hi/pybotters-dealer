FROM nikolaik/python-nodejs

COPY ./python/requirements.txt /requirements.txt

RUN python -m pip install -r requirements.txt

