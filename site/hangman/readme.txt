HOW TO TEST IN LOCAL

Start the backend (Springboot api called hangman-api) :
Go to the hangman-api directory and execute java -jar target/hangman-api-1.0-SNAPSHOT.jar

For the frontend :
We have to start an http server locally, with python. Go to the root directory and run the following command :
python -m http.server 9000
Note : very important to use the port 9000, because i Added CORS configuration in the Springboot to authorize connections from localhost:9000


