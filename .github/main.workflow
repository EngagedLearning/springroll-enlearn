workflow "Pull Request" {
  on = "pull_request"
  resolves = [
    "yarn lint",
    "yarn test",
    "yarn build"
  ]
}

action "check pr action" {
  uses = "actions/bin/filter@master"
  args = "action 'opened|synchronize'"
}

action "yarn install" {
  uses = "docker://node:10"
  needs = ["check pr action"]
  runs = "yarn"
  args = "install"
}

action "yarn build" {
  uses = "docker://node:10"
  needs = ["yarn install"]
  runs = "yarn"
  args = "build"
}

action "yarn test" {
  uses = "docker://node:10"
  needs = ["yarn install"]
  runs = "yarn"
  args = "test"
}

action "yarn lint" {
  uses = "docker://node:10"
  needs = ["yarn install"]
  runs = "yarn"
  args = "lint"
}
