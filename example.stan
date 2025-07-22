// file: example.stan
data {
    int male;
    int female;
}

parameters {
    real<lower=0, upper=1> p;
}

model {
    female ~ binomial(male + female, p);
}