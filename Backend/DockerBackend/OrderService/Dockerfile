# 🔹 Базовый runtime
FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS base
WORKDIR /app
EXPOSE 8080

# 🔹 Сборка проекта
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src

# копируем csproj и восстанавливаем зависимости
COPY ["OrderService.csproj", "./"]
RUN dotnet restore "OrderService.csproj"

# копируем всё остальное
COPY . .
RUN dotnet publish -c Release -o /app/publish

# 🔹 Финальный контейнер
FROM base AS final
WORKDIR /app
COPY --from=build /app/publish .
ENTRYPOINT ["dotnet", "OrderService.dll"]