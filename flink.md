## How I run Flink

>docker pull flink:1.18.0-scala_2.12

>docker network create  flink-network

>docker run -d --name=jobmanager --network flink-network -p 8081:8081 flink:1.18.0-scala_2.12 jobmanager

>docker run -d --name=taskmanager --network flink-network flink:1.18.0-scala_2.12 taskmanager

### for a optimal config going on just add -v and run the container along with the config file

>docker run -d --name=jobmanager --network flink-network \
>-p 8081:8081 \
>-v ${pwd}/custom-flinkconfig.yaml:/opt/flink/conf/flink-conf.yaml \
>flink:1.18.0-scala_2.12 jobmanager


>docker run -d --name=taskmanager --network flink-network \
>-v ${pwd}/custom-flinkconfig.yaml:/opt/flink/conf/flink-conf.yaml \
>flink:1.18.0-scala_2.12 taskmanager
