build:
	./node_modules/stylus/bin/stylus style.styl && \
	./node_modules/stylus/bin/stylus style.ie.styl

examples:
	./node_modules/stylus/bin/stylus examples/*.styl

watch:
	./node_modules/stylus/bin/stylus --watch style.styl

up:
	git pull --rebase && \
	npm install && \
	git submodule init && \
	git submodule update && \
	cd stylobate && \
	git checkout master && \
	git pull --rebase && \
	npm install && \
	cd ..
	cd skins/islands && \
	git checkout master && \
	git pull --rebase && \
	cd ..

serve:
	bundle exec jekyll serve --watch --config _config.yml,_config-dev.yml

.PHONY: build examples
