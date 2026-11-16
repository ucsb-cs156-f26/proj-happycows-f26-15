
# Deploying on Dokku

To deploy on dokku, see the instructions here:

* <https://ucsb-cs156.github.io/topics/dokku/deploying_an_app.html>

You will need the environment variables documented in the file `/docs/environment-variables.md` in this repo.

To include deployed commit information in Developer Info, use the recommended command:

* <tt>dokku git:set <i>appname</i> keep-git-dir true</tt>

## Docker build layout

The Dockerfile builds with Maven 3.9.16 and Temurin JDK 25, then copies the packaged jar and
`startup.sh` into a Temurin 25 JRE image. BuildKit caches Maven downloads and npm downloads;
separate dependency layers run before application source is copied. `.dockerignore` excludes
local credentials, generated output, and development files, but retains `.git` for build metadata.
Without `.git`, builds and startup still succeed; commit fields display `unknown`.
The runtime starts `/app/happycows.jar` through
`startup.sh`, which maps the database URL and uses `exec` to forward signals to Java.

Node comes from the Maven production profile, with its version set in `pom.xml`. Docker installs
it in `/opt/frontend` before `clean package` and uses `cache.use=true` only for that final build.
Normal production Maven builds keep `cache.use=false`. See [version maintenance](./versions.md)
for the image pins and frontend installation settings.

## Verifying the Docker build

Run from the repository root with Docker running and Buildx available. A fresh, dedicated builder
provides empty build and download caches for the cold run without clearing other projects' caches:

```bash
buildcheck="happycows-check-$(date +%s)"
docker buildx create --name "$buildcheck" --driver docker-container
build_image() {
  time docker buildx build --builder "$buildcheck" --load --progress=plain \
    --tag happycows:check .
}
build_image > docker-cold.log 2>&1
build_image > docker-warm.log 2>&1
```

After making an intended backend or frontend source edit, run `build_image > docker-source-change.log 2>&1`
in the same shell. Compare the timings at the end of the three logs and the `CACHED` steps: source
changes should reuse dependency layers when `pom.xml` and frontend package manifests are unchanged.
Inspect the logs for `sun.misc.Unsafe` warnings; do not suppress warnings to pass this check.
`--no-cache` alone does not empty BuildKit download cache mounts.

For a smoke test, prepare a local `.env` in Docker's env-file format with the deployment's database,
OAuth, and [MongoDB settings](./mongodb.md). Supply a container-reachable `DATABASE_URL` (or
`DOKKU_POSTGRES_AQUA_URL`, which takes precedence); `startup.sh` uses PostgreSQL username `postgres`.
See [environment variable guidance](./environment-variables.md) and [OAuth setup](./oauth.md).

```bash
docker run --detach --name happycows-check --publish 127.0.0.1:8080:8080 \
  --env-file .env happycows:check
curl --fail --retry 30 --retry-connrefused --retry-delay 2 \
  http://localhost:8080/ > /tmp/happycows-index.html
grep 'id="root"' /tmp/happycows-index.html
docker logs happycows-check
```

Confirm the page loads its bundled frontend assets in a browser and review the application logs
for startup errors before cleaning up:

```bash
docker stop happycows-check
docker rm happycows-check
docker buildx rm "$buildcheck"
```

Record the actual build results and timings when running this verification procedure.

# Short Version

This short version omits many details, but if you are already familiar with the process of deploying applications, you may be able to use this.

Note that you may need to modify:
* `happycows` to `happycows-qa` or `happycows-cgaucho` (where `cgaucho` is your github id)
* `https://github.com/ucsb-cs156/proj-happycows` to `https://github.com/ucsb-cs156-f25/proj-happycows-f24-17` or whatever your repo's url is
* `main` to `my-branch-name` for your feature branch
* `yourEmail@ucsb.edu` to your own email
* values for `CLIENT_ID`, `CLIENT_SECRET` etc from [Google](https://github.com/ucsb-cs156/proj-happycows/blob/main/docs/oauth.md) or [Github](https://github.com/ucsb-cs156/proj-happycows/blob/main/docs/github-app-setup-dokku.md) as appropriate


## Deploying `happycows`

```
dokku apps:create happycows
dokku git:set happycows keep-git-dir true
dokku config:set --no-restart happycows PRODUCTION=true
dokku config:set --no-restart happycows SOURCE_REPO=https://github.com/ucsb-cs156-f25/proj-happycows-f25-xx
dokku postgres:create happycows-db
dokku postgres:link happycows-db happycows
dokku git:sync happycows https://github.com/ucsb-cs156-f25/proj-happycows-f25-xx main
dokku ps:rebuild happycows
dokku letsencrypt:set happycows email yourEmail@ucsb.edu
dokku letsencrypt:enable happycows
dokku config:set happycows --no-restart GOOGLE_CLIENT_ID=get-value-from-google
dokku config:set happycows --no-restart GOOGLE_CLIENT_SECRET=get-value-from-google
```

## Deploying `happycows-qa`

```
dokku apps:create happycows-qa
dokku git:set happycows-qa keep-git-dir true
dokku config:set --no-restart happycows-qa PRODUCTION=true
dokku config:set --no-restart happycows-qa SOURCE_REPO=https://github.com/ucsb-cs156-f25/proj-happycows-f25-xx
dokku postgres:create happycows-qa-db
dokku postgres:link happycows-qa-db happycows-qa
dokku git:sync happycows-qa https://github.com/ucsb-cs156-f25/proj-happycows-f25-xx main
dokku ps:rebuild happycows-qa
dokku letsencrypt:set happycows-qa email yourEmail@ucsb.edu
dokku letsencrypt:enable happycows-qa
dokku config:set happycows-qa --no-restart GOOGLE_CLIENT_ID=get-value-from-google
dokku config:set happycows-qa --no-restart GOOGLE_CLIENT_SECRET=get-value-from-google
```
