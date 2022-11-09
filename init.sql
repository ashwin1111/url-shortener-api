create table url_shortner_users (
    id uuid primary key,
    name varchar(60) not null,
    email varchar(128) not null,
    password text,
    created_at date,
    verified boolean default false,
    source text default 'webapp',
    totp_key text
);

create table url (
    id text primary key,
    big_url text not null,
    short_url text not null,
    email varchar(128) not null,
    created_at date not null,
    expiry date,
    description text,
    last_updated_at date,
    title text,
    scraped boolean default false,
    clicks integer default 0
);

create table collections (
    id text primary key,
    name text not null,
    title text not null,
    description text,
    email varchar(128) not null,
    created_at date not null,
    url_id_collection text not null,
    clicks integer default 0
);
