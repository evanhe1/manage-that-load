## Frontend Deploy
`npm run build`
`firebase deploy`

## Backend Deploy
`docker tag mtl-backend remote-image`
`docker push remote-imagee`

## Build and Run Container Locally
`docker build -t mtl-backend-arm:latest .`
`docker run -p 8001:8001 -e mongo_uri mtl-image-arm`