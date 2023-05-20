# comic-processor

I buy a lot of DRM-free comics on [Humble Bundle](https://www.humblebundle.com/books) and sometimes even read them. The files often come in different formats - CBZ, CBR, and/or PDF. Sometimes the quality of one or another is less than ideal. And regardless, I like to compress them to save space yet keep readable quality. I also like to keep them all in CBZ format.

This repo is a series of scripts that I run as a cron via a Docker container that allows me to drop files in specific folders to have operations automatically done on them. In the end, I have a somewhat compressed CBZ file that I can move off to storage and read through _some app_ that I'm using at the moment.

In the event that this is useful to anyone else, here's how to get it working and what it does.

## Setup through docker

You can use and customize the `docker-compose.yml.example` file in this repo. The setup is pretty simple. Just point it at a folder, run `docker compose up processor` or `docker compose up -d processor` to run in the background and start dropping files in the correct folder.

## The folders

The following are the folders used by the system. They'll be created automatically in the directory you point at `/data` via docker.

 * **cbz/** Folders dropped in this directory have their contents zipped up and saved as a `.cbz` file. Once complete, the results are moved to `done/`
 * **done/** This is where finished `.cbz` files are dropped, ready to be moved to their Final Destination.
 * **epub/** Drop `.epub` files into this directory to have the images contained within them extracted and left in `./folder`. This is also like unzipping, but `.epub` files have a nested structure and this just makes it easy to plop them out.
 * **folder/** This is a manual step in the process. Files are extracted from other formats and dropped into here so that you can analyze the contents and maybe remove ads or any other pages you don't want in the final step. Move folders from this directory into `sizer` to resume the process.
 * **sizer/** Folders placed in this directory will have all their files run through [squoosh](https://squoosh.app/) to optimize and compress the file size. When done, results are moved to `cbz/` to zip them up as a `.cbz` file
 * **zip/** Drop `.cbz` or `.zip` files into this directory to have them be extracted and left in `./folder`. This is just unzipping the file, so you could also chose to do that yourself
