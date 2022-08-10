# Fetch Rewards Coding Exercise - Backend Software Engineering
This is a simple web service built using Node.js, a back end JavaScript runtime environment using V8 engine. It is meant to fulfill the requirements of the Fetch Rewards coding exercise for Backend Software Engineering role.

>## Dependencies
* Express | https://expressjs.com/
    * Nodejs back end web app framework that aids API construction
* Chai | https://www.chaijs.com/
    * A Behavior-Driven Development (BDD) / Test-Driven Development (TDD) assertion library for node and the browser, used for unit testing
* Chai-HTTP | https://www.chaijs.com/plugins/chai-http/
    * Plugin that allows HTTP integration testing with Chai assertions
* Mocha | https://mochajs.org/
    * A JavaScript test framework for Node.js programs

>## Overview

* A web service that stores a single user's points in memory from transactions across multiple payers/partners
* The service accepts HTTP requests to 3 separate routes:
    1. We can `add` transactions according to **payer**, **points**, and **timestamp**
    2. The user can `spend` points so long as:
        * Oldest points are spent first (based on transaction timestamp)
        * And no payer's points go negative
    3. The `balance` can be viewed to demonstrate the cumulative breakdown of points for each payer

>## Instructions

1. This program was built using v18.2.0 Node. Ensure that you have at least verson 16 or higher installed on your machine by writing below in the terminal.
    ```
    node --version
    ```
    Otherwise, follow to instructions at https://nodejs.org/en/ to get started installing Node.js.

2. Clone the repository locally and then proceed to install the requisite dependencies using Node Package Manager.
    ```
    npm install
    ```
3. Execute the 'start' script to get the server running.
    ```
    npm start
    ```
4. Visit http://localhost:8000 in your browser. You should see 'Hello world!' in the window indicating that the server is live.

5. We will utilize the **Postman** platform to interact with our Application Programming Interface. We will need the desktop app to interact with our server via localhost. Thus, go to https://www.postman.com/downloads/, download the 'Postman app' for your system, and make an account if you don't have one already. 
    * Navigate to 'Workspaces' tab and create a new workspace.
    * Open a new tab within the Postman workspace, so that we can start making new requests to the API.
    * The screen should look like so:

![New Postman Request Page](/assets/images/screen-1.jpg)

<br>

>## POST route - Let's add some transactions

* In our Postman request, select POST from the dropdown. Then, use the `/add` route in the request URL to submit transactions based on **payer** (string), **points** (integer), and **timestamp** (date).

    ```
    http://localhost:8000/api/add
    ```
* Next, we will prepare the data to be sent with our request:
    * Select `body` from along the tabs below the URL
    * Below that, select `raw` within the radio options
    * To the right you'll find a second dropdown menu, change to `JSON`
    * You can then input single JSON objects using the format seen in the samples below. 
    * It is assumed, based on the coding exercise, that negative transactions represent refunds to the payer carried out by the accounting team. Thus, negative transactions will deduct points from the most recent positive transaction for a given payer.

    ```
    { "payer": "DANNON", "points": 1000, "timestamp": "2020-11-02T14:00:00Z" }
    { "payer": "UNILEVER", "points": 200, "timestamp": "2020-10-31T11:00:00Z" }
    { "payer": "DANNON", "points": -200, "timestamp": "2020-10-31T15:00:00Z" }
    { "payer": "MILLER COORS", "points": 10000, "timestamp": "2020-11-01T14:00:00Z" }
    { "payer": "DANNON", "points": 300, "timestamp": "2020-10-31T10:00:00Z" }
    ```

* Your screen should look something like this:

![New Postman Request Page](/assets/images/screen-2.jpg)

* Finally, click 'send.' In the response section you should see a message return with a `200` HTTP status.

![New Postman Request Page](/assets/images/screen-3.jpg)

>## POST route - Spend points from the total point fund

* User spending is called via the `/spend` route. The request is made by submitting exculsively the number of **points** (integer) the user wants to spend. See below for the format to submit spend requests:

![New Postman Request Page](/assets/images/screen-4.jpg)

* After sending, the response will summarize which payers balances were deducted as a part of the expenditure. Remember:
    * Points are always spent in according to transaction history (oldest to newest)
    * An error will be returned if the spend request would exceed points available

![New Postman Request Page](/assets/images/screen-5.jpg)

>## GET route - Observe the cumulative point balances per payer

* The `/balance` route allows us to keep an eye on payers' point totals after a series of transactions and user expenditures. Change the request dropdown to `GET`. No data is sent with the request.

![New Postman Request Page](/assets/images/screen-6.jpg)

* The balances will be returned as such:

![New Postman Request Page](/assets/images/screen-7.jpg)

>## Testing our Routes

* We can use Chai/Mocha to reaffirm the routes we tested manually. Stop the server. Then, run the following script in the command line:

    ```
    npm test
    ```

    ![New Postman Request Page](/assets/images/screen-8.jpg)

>## Possible Optimizations

* Add additional HTTP verbs to the API
    * Example: Allow for updating (PUT) or removing (DELETE) transactions that were submitted incorrectly
* Provide a means of persistent data
    * Example: Databases such as MongoDB (https://www.mongodb.com/) or PostgreSQL (https://www.postgresql.org/)
* Implement additional checks for request body validation
    * Example: Validation library such as Express-Validator (https://express-validator.github.io/docs/) or Object modeling via Mongoose (https://mongoosejs.com/)

