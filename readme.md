# FedCare
This repository contains the code of the offline version for the paper "FedCare: Towards Interactive Diagnosis of FederatedLearning System Performance". The federated learning systems are already trained and their data are stored in advance.


## Installation

The system consists of two parts: the backend server, and the frontend interface.

### Prerequisites

Python 3.7+

Node 12.12.*

Yarn 1.22.*

Google Chrome Browser

### Data

Please download [data.zip](https://drive.google.com/file/d/1FRe_otV30hT1nkkiTkASKhgY9xeIRhmB/view?usp=sharing) and unzip it in backend/. The folder structure should be like:


``` 
backend
|-data
|   |-DIGIT5/
|   |-FEMNIST/
|   |LeNet-DIGIT5/
|   |LeNet-FEMNIST/
```
### Setup the backend

Install the dependencies in the backend/ directory:

``` 
cd backend
pip install -r requirements.txt
```

Start the backend server:

``` 
Python3 manage.py runserver
```

The server runs at http://localhost:8000 by default. Please keep it running while using the frontend interface.

### Setup the frontend

Install yarn:

``` 
npm -g install yarn
```

Install the dependencies in the frontend/ directory:

``` 
cd frontend
yarn
```

Start the frontend:

``` 
yarn start
```

The frontend runs at http://localhost:3000 by default. Please access it in the Google Chrome browser.