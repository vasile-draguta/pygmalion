# You can use most Debian-based base images
FROM node:22-slim

# Install dependencies and customize sandbox
WORKDIR /home/user/nextjs-app

RUN npx --yes create-next-app@latest . --yes

RUN npx --yes shadcn@latest init --yes -b neutral --force
RUN npx --yes shadcn@latest add --all --yes

# Move the Next.js app to the home directory and clean up
RUN mv /home/user/nextjs-app/* /home/user/ && rm -rf /home/user/nextjs-app

WORKDIR /home/user