NAME=ft_transcendence
COMPOSE_FILE=docker-compose.yml

all:
	docker compose -p $(NAME) -f $(COMPOSE_FILE) up --build -d

down:
	docker compose -p $(NAME) -f $(COMPOSE_FILE) down

clean:
	docker compose -p $(NAME) -f $(COMPOSE_FILE) down --volumes --remove-orphans

fclean: clean
	docker system prune -af

re: fclean all