# meltypuff
Developing Melty Puff Ec web site

```mermaid
graph TB
    %% ユーザー・外部アクセス
    User[👤 ユーザー<br/>ブラウザ]
    Developer[👨‍💻 開発者<br/>ローカル開発]
    Internet[🌐 インターネット]
    
    %% AWS本番環境
    subgraph AWS["☁️ AWS 本番環境"]
        Route53[🌍 Route53<br/>DNS管理]
        CloudFront[🚀 CloudFront CDN]
        ALB[🔄 Application Load Balancer]
        
        subgraph ECS["🐳 Amazon ECS"]
            ECS_nginx[nginx Container<br/>Port: 80]
            ECS_frontend[React Container<br/>Port: 3000]
            ECS_backend[Flask Container<br/>Port: 5001]
        end
        
        EFS[📁 Amazon EFS<br/>JSON Database]
        S3[📦 Amazon S3<br/>静的ファイル]
        RDS[🗄️ Amazon RDS<br/>将来移行予定]
        ECR[📦 Amazon ECR<br/>コンテナ保存]
        CloudWatch[📊 CloudWatch<br/>監視・ログ]
    end
    
    %% 開発環境
    subgraph DevEnv["💻 開発環境"]
        subgraph Docker["🐳 Docker環境"]
            Dev_nginx[nginx Container<br/>Port: 80]
            Dev_frontend[React Container<br/>Port: 3000] 
            Dev_backend[Flask Container<br/>Port: 5001]
        end
        
        subgraph LocalFiles["📁 ローカルファイル"]
            frontend_code[frontend/<br/>React + Vite]
            backend_code[backend/<br/>Flask API]
            nginx_config[nginx/<br/>設定ファイル]
            json_data[data/<br/>JSON Database]
        end
    end
    
    %% CI/CD
    subgraph Pipeline["🔄 CI/CD Pipeline"]
        GitHub[📚 GitHub<br/>ソースコード]
        Actions[⚙️ GitHub Actions<br/>自動デプロイ]
    end
    
    %% JSON Database詳細
    subgraph JSONFiles["📄 JSON Database"]
        users_json[users.json<br/>ユーザーデータ]
        products_json[products.json<br/>商品データ]
        orders_json[orders.json<br/>注文データ]
        config_json[config.json<br/>設定データ]
    end
    
    %% データベース進化
    subgraph Evolution["🔄 DB進化パス"]
        Phase1[Phase1: JSON<br/>高速開発]
        Phase2[Phase2: SQLite<br/>構造化]
        Phase3[Phase3: PostgreSQL<br/>本格運用]
    end
    
    %% アクセスフロー（本番）
    User --> Internet
    Internet --> Route53
    Route53 --> CloudFront
    CloudFront --> ALB
    CloudFront --> S3
    ALB --> ECS_nginx
    ECS_nginx --> ECS_frontend
    ECS_nginx --> ECS_backend
    ECS_backend --> EFS
    
    %% 開発フロー
    Developer --> Dev_frontend
    Developer --> Dev_nginx
    Developer --> Dev_backend
    Dev_backend --> json_data
    
    %% JSON構成
    json_data --> users_json
    json_data --> products_json
    json_data --> orders_json
    json_data --> config_json
    
    %% データベース進化
    Phase1 --> Phase2
    Phase2 --> Phase3
    Phase3 --> RDS
    
    %% CI/CD
    Developer --> GitHub
    GitHub --> Actions
    Actions --> ECR
    Actions --> ECS
    
    %% ファイルマウント
    frontend_code -.-> Dev_frontend
    backend_code -.-> Dev_backend
    nginx_config -.-> Dev_nginx
    
    %% AWS内部接続
    ECS_nginx --> ECS_frontend
    ECS_nginx --> ECS_backend
    ECS --> CloudWatch
    
    %% 本番データ永続化
    EFS --> users_json
    EFS --> products_json
    EFS --> orders_json
    EFS --> config_json
    
    %% スタイリング
    classDef awsService fill:#ff9900,stroke:#146eb4,stroke-width:2px,color:#ffffff
    classDef devService fill:#e1f5fe,stroke:#01579b,stroke-width:2px
    classDef container fill:#0db7ed,stroke:#2496ed,stroke-width:2px,color:#ffffff
    classDef jsonFile fill:#ffc107,stroke:#795548,stroke-width:2px
    classDef pipeline fill:#28a745,stroke:#155724,stroke-width:2px,color:#ffffff
    classDef user fill:#6f42c1,stroke:#495057,stroke-width:2px,color:#ffffff
    classDef evolution fill:#6c757d,stroke:#343a40,stroke-width:2px,color:#ffffff
    
    class Route53,CloudFront,ALB,EFS,S3,RDS,ECR,CloudWatch,AWS awsService
    class DevEnv,Docker,LocalFiles devService
    class Dev_nginx,Dev_frontend,Dev_backend,ECS_nginx,ECS_frontend,ECS_backend,ECS container
    class users_json,products_json,orders_json,config_json,JSONFiles,json_data jsonFile
    class Pipeline,GitHub,Actions pipeline
    class User,Developer,Internet user
    class Evolution,Phase1,Phase2,Phase3 evolution