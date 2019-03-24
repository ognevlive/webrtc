FROM ubuntu:latest
MAINTAINER liveguard
RUN apt-get update -y
RUN apt-get install -y python-pip python-dev build-essential
COPY . /source
WORKDIR /source 
RUN pip install -r requirements.txt
COPY 511rtc.crt 511rtc.crt
COPY 511rtc.csr 511rtc.csr
COPY 511rtc.key 511rtc.key
ENTRYPOINT ["python"]
CMD ["run.py"]
