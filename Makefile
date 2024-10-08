NAME=ft_transcendence
COMPOSE_FILE=docker-compose.yml

all: prod

prod:
	docker compose -p $(NAME) -f $(COMPOSE_FILE) up --build -d

dev:
	docker compose -p $(NAME) -f $(COMPOSE_FILE) up --build -d

down:
	docker compose -p $(NAME) -f $(COMPOSE_FILE) down

stop:
	docker compose -p $(NAME) -f $(COMPOSE_FILE) stop

clean:
	docker compose -p $(NAME) -f $(COMPOSE_FILE) down --volumes --remove-orphans

dclean:
	docker system prune -af
	
re: clean all