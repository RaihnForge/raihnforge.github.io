docker run --rm -it `
    -v "$PWD:/srv/jekyll" `
    -p 4000:4000 `
    jekyll/jekyll `
    sh -c "gem install webrick && jekyll serve --host 0.0.0.0 --force_polling --drafts"
