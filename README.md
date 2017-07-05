# front-end-dojo-contact-list

Enclosed in this project, lies a small Java application that exposes a 
REST service that returns a list of People.

This service can be reached using the following URL:

    http://localhost:8090/rest/people

It will return a JSON object. To run the service, you will need to build the application.
For that, you will need to install Java JDK and Maven.

After you sucessfully installed everything, just open a command and run:

    mvn clean package
    
To run, either call Java or run Maven

    java -jar target/people-rest.war
    
or

    mvn spring-boot:run

The client installation you must run

    npm install
	
inside the webapp folder

## Proposed Exercise

Create an app to present the resulting data from the REST service. The way you present is up to you, as long you follow the premises.

Premises:
* Use *dstore* to hold the data
* Use *dgrid* to create the contact list
* Create a way to add and remove contacts into the local list
* The application must be implemented using _Dojo_. 

## Challenges

1. Store locally on client using IndexedDB _or_ ...
2. Create a list CRUD on server's contact list _or_ ...
3. Import and create intern tests

## Measuring results

Send the exact instructions on how to install dependencies, compile and run
the application, in a way even a newbie would understand. 

## Useful links

* https://dojotoolkit.org/
* http://dgrid.io/
* http://dstorejs.io/