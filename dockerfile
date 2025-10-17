FROM imbios/bun-node:latest

WORKDIR /app

COPY package.json bun.lock ./

RUN bun install

COPY . .

RUN bun build

CMD ["bun", "start"]
