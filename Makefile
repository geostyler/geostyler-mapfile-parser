PROJECT_NAME = 'geostyler_mapfile_parser'
DOCKER_BASE = ${PROJECT_NAME}

.PHONY: run
run: build-all
	docker-compose -p ${PROJECT_NAME} down
	docker-compose -p ${PROJECT_NAME} up

.PHONY: build-all
build-all: build-data

.PHONY: build-data
build-data:
	docker build --tag=$(DOCKER_BASE)_data data
