# encoding: UTF-8
# This file is auto-generated from the current state of the database. Instead
# of editing this file, please use the migrations feature of Active Record to
# incrementally modify your database, and then regenerate this schema definition.
#
# Note that this schema.rb definition is the authoritative source for your
# database schema. If you need to create the application database on another
# system, you should be using db:schema:load, not running all the migrations
# from scratch. The latter is a flawed and unsustainable approach (the more migrations
# you'll amass, the slower it'll run and the greater likelihood for issues).
#
# It's strongly recommended that you check this file into your version control system.

ActiveRecord::Schema.define(version: 20130720202813) do

  # These are extensions that must be enabled in order to support this database
  enable_extension "plpgsql"

  create_table "divisions", force: true do |t|
    t.string   "divisionName"
    t.integer  "league_id"
    t.datetime "created_at"
    t.datetime "updated_at"
  end

  add_index "divisions", ["league_id"], name: "index_divisions_on_league_id", using: :btree

  create_table "leagues", force: true do |t|
    t.string   "leagueName"
    t.integer  "season_id"
    t.datetime "created_at"
    t.datetime "updated_at"
  end

  add_index "leagues", ["season_id"], name: "index_leagues_on_season_id", using: :btree

  create_table "players", force: true do |t|
    t.string   "surName"
    t.string   "givenName"
    t.integer  "atBats"
    t.integer  "runs"
    t.integer  "hits"
    t.integer  "homeRuns"
    t.integer  "rbi"
    t.integer  "steals"
    t.integer  "sacrificeFlies"
    t.integer  "walks"
    t.integer  "beans"
    t.integer  "team_id"
    t.datetime "created_at"
    t.datetime "updated_at"
    t.integer  "doubles"
    t.integer  "triples"
    t.integer  "totalBases"
    t.float    "avg"
    t.float    "slg"
    t.float    "obp"
    t.float    "ops"
  end

  add_index "players", ["team_id"], name: "index_players_on_team_id", using: :btree

  create_table "seasons", force: true do |t|
    t.integer  "year"
    t.datetime "created_at"
    t.datetime "updated_at"
  end

  create_table "teams", force: true do |t|
    t.string   "teamCity"
    t.string   "teamName"
    t.integer  "division_id"
    t.datetime "created_at"
    t.datetime "updated_at"
  end

  add_index "teams", ["division_id"], name: "index_teams_on_division_id", using: :btree

end
