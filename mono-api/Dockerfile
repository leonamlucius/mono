FROM python:3.10-slim

RUN pip install --no-cache-dir piper-tts flask piper-phonemize

EXPOSE 5000

ENTRYPOINT ["python3", "-m", "piper.http_server"]