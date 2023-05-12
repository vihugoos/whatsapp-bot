<div id="top"> </div> 

<!---- PROJECT LOGO ----> 
<div align="center">
  <h2 align="center"> 
    Liber WhatsApp Bot  
  </h2>
  
  <p align="center">
    A whatsapp bot for Liber company, developed with Node.js <br/> 
    Explore <a href="https://nodejs.org/en/docs/">Node.js</a> docs &#187; <br/> <br/>
    <a href="https://github.com/vihugoos/whatsapp-bot/issues"> Report Bug </a> &nbsp;•&nbsp;
    <a href="https://github.com/vihugoos/whatsapp-bot/issues"> Request Feature </a>
  </p>
</div>


<!---- TABLE OF CONTENTS ----> 
<details>
  <summary> Table of Contents </summary>
  <ol>
    <li>
      <a href="#about-the-project"> About The Project </a>
      <ul>
        <li><a href="#built-with"> Built With </a></li>
      </ul>
    </li>
    <li>
      <a href="#getting-started"> Getting Started </a>
      <ul>
        <li><a href="#prerequisites"> Prerequisites </a></li>
        <li><a href="#installation"> Installation </a></li>
        <li><a href="#usage"> Usage </a></li>
      </ul>
    </li>
    <li>
      <a href="#bot-documentation"> Bot Documentation </a>
      <ul>
        <li><a href="#standard-flows"> Standard Flows </a></li>
        <li><a href="#flags"> Flags </a></li>
        <li><a href="#satisfaction-surveys"> Satisfaction Surveys </a></li>
        <li><a href="#viewing-messages"> Viewing Messages </a></li>
        <li><a href="#about-database"> About Database </a></li>
      </ul>
    </li>
    <li>
      <a href="#infrastructure-liber"> Infrastructure Liber </a>
      <ul>
        <li><a href="#url-of-each-app"> URL of each app </a></li>
      </ul>
    </li>
    <li><a href="#grafana-dashboard"> Grafana Dashboard </a></li>
    <li><a href="#contributing"> Contributing </a></li>
    <li><a href="#contact"> Contact </a></li>
  </ol>
</details>


<!---- THE PROJECT ---->
## About The Project 

<div align="center">
  <video preload controls loop type="video/mp4" height="350" src="https://user-images.githubusercontent.com/44311634/228022341-939d4c83-2842-4efb-9f65-7ac07cee8398.mp4">
    Sorry, your browser does not support embedded videos.
  </video>
</div> <br/>

A bot for whatsapp to perform an automatic pre-service to the customer, registration of new customers, opening and assigning solicitations to Liber employees. Integration with Discord through Webhooks, to notify in real time when there are new customer solicitation and mark the responsible person, in addition to notifying new non-customer contacts and identify when a solicitation was closed to send in the closed solicitations channel, along with the service protocol. 


### Built With 

<div style="display: inline_block">
    <!-- Icon Node.js --> 
    <a href="https://nodejs.org/en"> 
      <img align="center" alt="Icon-Nodejs" height="35" src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/nodejs/nodejs-original.svg"> 
    </a> &nbsp;
    <!-- Icon whatsapp-web.js --> 
    <a href="https://wwebjs.dev/"> 
      <img align="center" alt="Icon-whatsapp-web.js" height="35" src="https://user-images.githubusercontent.com/44311634/227283914-ecddcee3-df90-4e50-8a45-db69b33af240.png"> 
    </a> &nbsp; 
    <!-- Icon Axios --> 
    <a href="https://axios-http.com/"> 
      <img align="center" alt="Icon-Axios" height="55" src="https://user-images.githubusercontent.com/44311634/178089407-0176462e-7e60-4f4f-9ad8-5429a22b2c5c.png"> 
    </a> &nbsp; 
    <!-- Icon Prisma -->
    <a href="https://www.prisma.io/"> 
      <img align="center" alt="Icon-Prisma" height="30" src="https://user-images.githubusercontent.com/44311634/178335052-08bb4b29-c4da-4100-ae71-8b65cf6cd581.png"> 
    </a> &nbsp;
     <!-- Icon PostgreSQL --> 
    <a href="https://www.postgresql.org/"> 
      <img align="center" alt="Icon-PostgreSQL" height="35" src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/postgresql/postgresql-plain.svg"> 
    </a> &nbsp;
    <!-- Icon Docker -->
    <a href="https://www.docker.com/"> 
      <img align="center" alt="Icon-Docker" height="53" src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/docker/docker-original.svg"> 
    </a> 
</div>

<br/>
<br/>


<!---- GETTING STARTED ----> 
## Getting Started

To get started, you need to have <strong>Node.js 18+</strong> installed on your machine, for more information visit <a href="https://nodejs.org/en/download/"> Node.js Downloads</a>. You will also need to have <strong>Docker</strong> installed, for more information visit <a href="https://docs.docker.com/engine/install/">Docker Engine Install</a>. 

<strong>Obs:</strong> This guide will only serve to run the project locally (development environment), initially based on linux systems.


### Prerequisites 

Other than Node.js and Docker installed, you also need to have Google Chrome installed, because the library for automating whatsapp uses puppeteer to launch and control the browser, for more information visit <a href="https://www.google.com/chrome/">Google Chrome Download</a>. 


### Installation 

1. Clone the repo 
   ```bash
   git clone https://github.com/vihugoos/whatsapp-bot.git
   ```
2. Inside the project root directory install all project dependencies 
   ```cmd
   npm install
   ```
3. Create an `.env` file with environment variables 
   ```bash
   cat > .env << EOF
   DATABASE_URL="postgresql://postgres:docker@localhost:5432/liber?schema=public"
   
   DISCORD_WEBHOOK_URL_OPEN_SOLICITATIONS=yourDiscordChannelWebhookURL

   DISCORD_WEBHOOK_URL_CLOSED_SOLICITATIONS=yourDiscordChannelWebhookURL

   DISCORD_WEBHOOK_URL_NON_CUSTOMERS=yourDiscordChannelWebhookURL
   EOF
   ```
4. Create a postgres container docker
   ```cmd
   docker run --name liber -e POSTGRES_DB=liber -e POSTGRES_PASSWORD=docker -p 5432:5432 -d postgres 
   ```
4. Run the migrate
   ```cmd
   npx prisma migrate dev
   ```


<!---- USAGE EXAMPLES ----> 
## Usage

With the installation complete, we can start the project.

* Starting the project 
   ```bash
   npm run dev  
   ```

<br/> 


## Bot Documentation 

### Standard Flows 

1. Selecting "Não sou cliente", the bot sends this case to our commercial representative, who will later be able to release the registration if the payment is approved.

2. If the registration is released, the bot will request all the necessary data and will register automatically (also already validating if the data entered are correct). 

3. Customer sends any message, the bot identifies him by cell phone number and sends service options immediately.

4. The customer has changed his number and selects the option "Já sou cliente", the CPF is requested for confirmation and the registration is automatically updated.

5. Selecting "Já sou cliente", but the CPF was not found in the database, the case is sent for assistance and further analysis. 

<br/> 


### Flags

* <strong>"atendimento finalizado"</strong>: If any Liber attendant sends a message that has these two words included, the bot ends the service. 

* <strong>"prosseguimento no seu cadastro"</strong>: If our sales representative sends a message that includes this phrase, the bot will take over from here and automatically proceed with the registration of the new customer.

* <strong>"em que posso ajudar"</strong>: If an attendant/commercial representative sends a message that has this phrase included, the bot puts the customer in a state of assistance immediately and stops responding to any message.

<br/> 


### Satisfaction Surveys:

Satisfaction surveys are only sent to users who have actually placed an order with us (in fact, our customers).

<br/> 

### Viewing Messages:

The robot only sees messages from customers who are not being attended to, if so, it stops viewing them.

<br/> 


### About Database:

<strong>Customers</strong>: All customer data is stored, namely: name, CPF, ID, email and cell phone number.

<strong>Solicitations</strong>: The data of all solicitations are generated automatically and stored in the database, namely: Service protocol, customer ID, which service is requested, status (open or closed), solicitation opening date, date on which the service was completed and the answer to the customer satisfaction survey.

<strong>Attendants</strong>: The following data of our attendants are saved in the database: name, discord username, discord ID and status (whether they are currently in attendance or not).

<br/> 


## Infrastructure Liber

<div align="center">
  <img src="https://user-images.githubusercontent.com/44311634/236981212-fd38fca0-5fec-460a-904e-b747a6be0a7b.png" alt="Logo" height="550" /> 
</div>

### URL of each app: 

Note: All of the above services were done by me.  

Website Liber: https://libermedicos.com/

Dashboard (Operational Monitoring): https://grafana.libermedicos.com/

Prisma platform (Data Manipulation): https://cloud.prisma.io/ 

<br/> 


## Grafana Dashboard 

<div align="center">
  <img src="https://github.com/vihugoos/whatsapp-bot/assets/44311634/3480ceff-91e7-4358-875a-116badad5550" alt="Logo" /> 
</div> <br>

A dashboard created in Grafana to view all information about requests. Total number of customers, total solicitations, open and closed solicitations, average service time, etc. There is a tab for customer information and another for non-customers. In fact, a complete dashboard in which it is possible to carry out all the company's operational follow-up.

<br>

<!---- CONTRIBUTING ----> 
## Contributing

Contributions are what make the open source community such an amazing place to learn, inspire, and create. Any contributions you make are **greatly appreciated**.

If you have a suggestion that would make this better, please fork the repo and create a pull request. You can also simply open an issue with the tag "enhancement".
Don't forget to give the project a star! Thanks again!

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request
<br/> 


<!---- CONTACT ---->
## Contact

Developer @vihugoos - victorhugoos@live.com  

<p align="right"><a href="#top"> &#129045; back to top </a></p> 
