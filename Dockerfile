# syntax=docker/dockerfile:1
FROM maven:3.9.16-eclipse-temurin-25-noble AS builder

WORKDIR /home/app

COPY pom.xml .
COPY .mvn .mvn

RUN --mount=id=156-base-mvn,type=cache,target=/root/.m2/repository \
    mvn --no-transfer-progress -B -Pproduction dependency:go-offline

COPY frontend/package-lock.json frontend/package.json frontend/

# Keep Node outside target so clean package preserves the cached installation.
RUN --mount=id=156-base-mvn,type=cache,target=/root/.m2/repository \
    --mount=id=156-base-npm,type=cache,target=/root/.npm \
    mvn --no-transfer-progress -B -Pproduction \
    -Dapp.frontend.installDirectory=/opt/frontend \
    com.github.eirslett:frontend-maven-plugin:install-node-and-npm@install-node-and-npm \
    com.github.eirslett:frontend-maven-plugin:npm@npm-install

COPY . .

RUN --mount=id=156-base-mvn,type=cache,target=/root/.m2/repository \
    mvn --no-transfer-progress -B -Pproduction -DskipTests \
    -Dcache.use=true -Dapp.frontend.installDirectory=/opt/frontend \
    -f /home/app/pom.xml clean package

FROM eclipse-temurin:25-jre-alpine

WORKDIR /app

RUN apk add --no-cache bash curl

COPY --from=builder --chmod=755 /home/app/startup.sh ./startup.sh
COPY --from=builder /home/app/target/happycows-*.jar ./happycows.jar

ENV PRODUCTION=true

ENTRYPOINT ["./startup.sh", "/app/happycows.jar"]
