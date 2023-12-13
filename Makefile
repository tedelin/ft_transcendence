NAME=ft_transcendence
COMPOSE_FILE=docker-compose.yml

all:
	docker compose -p $(NAME) -f $(COMPOSE_FILE) up --build -d

down:
	docker compose -p $(NAME) -f $(COMPOSE_FILE) down

clean:
	docker compose -p $(NAME) -f $(COMPOSE_FILE) down --volumes --remove-orphans

dclean:
	docker stop $$(docker ps -qa); \
	docker rm $$(docker ps -aq); \
	docker rmi -f $$(docker images -qa); \
	docker volume rm $$(docker volume ls -q); \
	docker network rm $$(docker network ls -q) 2>/dev/null

fclean: clean
	docker system prune -af

re: fclean all