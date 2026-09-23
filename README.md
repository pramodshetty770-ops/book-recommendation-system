# book-recommendation-system
AI-powered Book Recommendation System using collaborative filtering, cosine similarity, and interactive analytics.
#  Book Recommendation System

An interactive **Book Recommendation System** built with React and TypeScript that uses collaborative filtering and cosine similarity to generate personalized book recommendations.

The application provides an analytics dashboard, recommendation engine, book and user analysis, model performance evaluation, custom dataset upload, and PDF report generation.

##  Features

*  Interactive recommendation system dashboard
*  Personalized recommendations based on user ratings
*  Item-based collaborative filtering
*  User-based collaborative filtering
*  Book-to-book similarity using cosine similarity
*  Recommendation performance evaluation
*  Precision@K, Recall@K and Hit Rate@K
*  Catalog coverage analysis
*  Book and genre analytics
*  User reading and rating analysis
*  Rating distribution and similarity visualizations
*  Upload custom `books.csv` and `ratings.csv` datasets
*  Dynamic insights based on dataset and recommendation results
*  Generate downloadable PDF reports
*  Responsive dashboard interface

##  Recommendation Techniques

### 1. Item-Based Collaborative Filtering

The system recommends books based on the similarity between books.

Books are compared using users' ratings, and cosine similarity is used to determine how closely two books are related.

### 2. User-Based Collaborative Filtering

The system identifies users with similar rating patterns and uses their preferences to generate recommendations.

### 3. Cosine Similarity

Cosine similarity is used to calculate similarity between rating vectors.

The basic formula is:

```text
Similarity(A, B) = (A · B) / (||A|| × ||B||)
```

A higher similarity value indicates more similar rating behavior.

##  Model Evaluation

The system includes offline evaluation using a hold-out testing approach.

It calculates:

* Precision@5
* Precision@10
* Precision@20
* Recall@5
* Recall@10
* Recall@20
* Hit Rate@5
* Hit Rate@10
* Hit Rate@20
* Catalog Coverage

The application also visualizes the distribution of book-pair similarity scores.

##  Application Sections

### Dashboard

Provides an overview of:

* Book catalog
* Users
* Ratings
* Rating distributions
* Reading activity
* Recommendation insights

### Recommendations

Allows users to select a reader and generate personalized book recommendations.

It also provides item-to-item book similarity information.

### Book & User Analysis

Explore:

* Individual books
* Book details
* User profiles
* Rating history
* Genre preferences
* Reading patterns

### Recommendation Performance

Displays the performance of the recommendation algorithms using different evaluation metrics.

##  Project Structure

```text
book-recommendation-system/
│
├── public/
│   ├── data/
│   │   ├── books.csv
│   │   └── ratings.csv
│   └── assets/
│
├── src/
│   ├── components/
│   │   ├── BookDetails.tsx
│   │   ├── BookTable.tsx
│   │   ├── RecommendationCard.tsx
│   │   ├── RecommendationList.tsx
│   │   ├── RecommendationMetrics.tsx
│   │   ├── SimilarBookCard.tsx
│   │   ├── UserDetails.tsx
│   │   └── ...
│   │
│   ├── pages/
│   │   ├── Dashboard.tsx
│   │   ├── Recommendations.tsx
│   │   ├── BookUserAnalysis.tsx
│   │   └── RecommendationPerformance.tsx
│   │
│   ├── recommendation/
│   │   ├── preprocessing.ts
│   │   ├── cosineSimilarity.ts
│   │   ├── itemBasedCF.ts
│   │   ├── userBasedCF.ts
│   │   ├── recommendationEngine.ts
│   │   └── evaluation.ts
│   │
│   ├── services/
│   │   └── dataset.ts
│   │
│   ├── utils/
│   │   ├── bookAnalysis.ts
│   │   ├── genreAnalysis.ts
│   │   ├── userAnalysis.ts
│   │   ├── insights.ts
│   │   └── reportGenerator.ts
│   │
│   ├── App.tsx
│   ├── main.tsx
│   └── types.ts
│
├── package.json
├── tsconfig.json
├── vite.config.ts
└── README.md
```

##  Tech Stack

* **React**
* **TypeScript**
* **Vite**
* **Tailwind CSS**
* **Lucide React**
* **CSV-based datasets**
* **Collaborative Filtering**
* **Cosine Similarity**
* **Data Visualization**
* **PDF Report Generation**

##  Dataset

The application uses two CSV files:

### `books.csv`

Contains information about books in the catalog.

### `ratings.csv`

Contains user ratings associated with books.

The application preprocesses these datasets and creates user-rating and book-rating mappings for the recommendation algorithms.

##  Custom Dataset

You can upload your own datasets through the application's upload interface.

Provide:

```text
books.csv
ratings.csv
```

The application parses and processes the uploaded data before running the recommendation and evaluation algorithms.

##  Getting Started

### Prerequisites

Make sure you have:

* Node.js installed
* npm installed

### Installation

Clone the repository:

```bash
git clone https://github.com/YOUR-USERNAME/book-recommendation-system.git
```

Navigate into the project:

```bash
cd book-recommendation-system
```

Install dependencies:

```bash
npm install
```

### Run the Application

```bash
npm run dev
```

Open the local development URL shown in your terminal.

##  How It Works

```text
Books + Ratings Dataset
          ↓
     Data Processing
          ↓
   Rating Matrices
          ↓
 ┌────────┴─────────┐
 ↓                  ↓
User-Based CF    Item-Based CF
 ↓                  ↓
 └────────┬─────────┘
          ↓
   Recommendation
       Engine
          ↓
 Personalized
 Recommendations
          ↓
 Performance
 Evaluation
```

##  Evaluation Method

For offline evaluation, users with sufficient ratings are selected.

One positively rated book is held out as a test item, while the remaining ratings are used to generate recommendations.

The system then checks whether the held-out book appears in the Top-5, Top-10, or Top-20 recommendations.

This allows the application to calculate recommendation performance metrics such as Hit Rate, Precision, Recall, and Catalog Coverage.

##  PDF Reports

The application can generate a PDF report containing information such as:

* Selected user
* Selected book
* Recommendations
* Dataset statistics
* Evaluation metrics
* Generated insights

##  Project Objective

The main objective of this project is to demonstrate how **collaborative filtering and similarity-based recommendation techniques** can be applied to build an interactive book recommendation platform.

It combines recommendation algorithms with data analysis and visualization to make the behavior and performance of the recommendation system easier to understand.

## 🔮 Future Improvements

Possible improvements include:

* Hybrid recommendation models
* Content-based filtering using book metadata
* More advanced machine-learning models
* Improved cold-start handling
* Real-time recommendation updates
* Larger datasets
* User authentication
* Cloud database integration
* Advanced recommendation evaluation
* Deployment as a production web application

