class StatsController < ApplicationController

  ## Main view
  def view
    @seasons = Season.all
    ## Sanity check: see if the XML file(s) have already been loaded into the database.
    if !@seasons || @seasons.empty?
      ## Need to load the database 
      puts "Need to load the database"
      loadDatabase
      ## Now recreate the @seasons object
      @seasons = Season.all
    end
    respond_to do |format|
      format.html
      format.xml  { render :xml  => @seasons         }
      format.json { render :json => @seasons.to_json }
    end
  end

  ## APIs for the various AJAX functions
  def fetchSeasons
    @seasons = Season.all
    ## Sanity check: see if the XML file(s) have already been loaded into the database.
    if !@seasons || @seasons.empty?
      ## Need to load the database 
      puts "Need to load the database"
      loadDatabase
      ## Now recreate the @seasons object
      @seasons = Season.all
    end
    respond_to do |format|
      format.xml  { render :xml  => @seasons         }
      format.json { render :json => @seasons.to_json }
    end
  end

  def fetchSeason
    @season = Season.find_by_year( params[ :year ] )
    respond_to do |format|
      format.xml  { render :xml  => @season         }
      format.json { render :json => @season.to_json }
    end
  end

  def fetchLeaguesForYear
    @season = Season.find_by_year( params[ :year ] ) 
    @leagues = @season.leagues
    puts "Done fetching leagues"

    respond_to do |format|
      format.xml  { render :xml  => @leagues         }
      format.json { render :json => @leagues.to_json }
    end
  end

  def fetchDivisionsForLeague
    @season = Season.find_by_year( params[ :year ] ) 
    @league = @season.leagues.find( params[ :leagueID ] )
    @divisions = @league.divisions
    respond_to do |format|
      format.xml  { render :xml  => @divisions         }
      format.json { render :json => @divisions.to_json }
    end
  end

  def fetchTeamsForYear
    season = Season.find_by_year( params[ :year ] )

    ## First make up a list of teams
    teams = Array.new

    ## Get an array of leagues and ...
    leagues = season.leagues
    
    ## ... loop over them
    leagues.each do |league|

      ## Get an array of divisions and ...
      divisions = league.divisions

      ## ... loop over them
      divisions.each do |division|

        ## Get all the teams and add them to the list
        teams.concat( division.teams );
      end
    end
    respond_to do |format|
      format.xml  { render :xml  => teams  }
      format.json { render :json => teams  }
    end
  end


  def fetchStatsForYear
    season  = Season.find_by_year( params[ :year ] )

    ## First make up a list of players
    players = Array.new

    ## Get an array of leagues and ...
    if params[ :leagueID ]
      leagues = Array.new( 1, season.leagues.find( params[ :leagueID ] ) )
    else
      leagues = season.leagues
    end
    
    ## ... loop over them
    leagues.each do |league|

      ## Get an array of divisions and ...
      if params[ :divisionID ]
        divisions = Array.new( 1, league.divisions.find( params[ :divisionID ] ) )
      else
        divisions = league.divisions
      end

      ## ... loop over them
      divisions.each do |division|

        ## Get all the teams and ...
        teams = division.teams

        ## ... make up a list of all of their players.
        teams.each do |team|
          players.concat( team.players )
        end
      end
    end

    puts "Found #{players.size} players"

    ## Sort according to the given criterion, checking if the direction was specified
    if !params[ :dir ] || params[ :dir ] == 'asc'
      players.sort!{ |p1, p2| p1[ params[ :stat ]] <=> p2[params[ :stat ]] }
      direction = "Ascending"
    else
      players.sort!{ |p1, p2| p2[ params[ :stat ]] <=> p1[params[ :stat ]] }
      direction = "Descending"
    end

    ## Return the first 25 elements
    respond_to do |format|
      format.xml { render :xml => players[0, 25] }
      format.json { render :json => { :criterion => params[ :stat ], :direction => direction, :players => players[0, 25] }}
    end
  end
    
  private
  def loadDatabase
    require 'nokogiri'

    ##xmlFile     = File.open( 'public/resources/1998statistics.xml' )
    xmlFile     = File.open( 'app/assets/1998statistics.xml' )
    xmlDocument = Nokogiri.XML( xmlFile )
    xmlFile.close

    ## Loop over the seasons
    seasons = xmlDocument.search( 'SEASON' ).map do |season|
      year = season.at( 'YEAR' ).text
      
      ## Loop over the leagues
      leagues = season.search( 'LEAGUE' ).map do |league|
        leagueName = league.at( 'LEAGUE_NAME' ).text
        
        ## Loop over the divisions
        divisions = league.search( 'DIVISION' ).map do |division|
          divisionName = division.at( 'DIVISION_NAME' ).text
          
          ## Loop over teams
          teams = division.search( 'TEAM' ).map do |team|
            teamCity = team.at( 'TEAM_CITY' ).text
            teamName = team.at( 'TEAM_NAME' ).text
            
            ## Loop over the players
            players  = team.search( 'PLAYER' ).map do |player|
              if player.at( 'AT_BATS' )
                %w[SURNAME GIVEN_NAME AT_BATS RUNS HITS HOME_RUNS RBI STEALS SACRIFICE_FLIES WALKS HIT_BY_PITCH DOUBLES TRIPLES].each_with_object({}) do |stat, o|
                  o[stat] = player.at( stat ).text
                end
              end
            end
            
            { :teamCity => teamCity, :teamName => teamName, :players => players }
          end ## End of loop over teams
          { :divisionName => divisionName, :teams => teams }
        end ## End of loop over divisions
        { :leagueName => leagueName, :divisions => divisions }
      end ## End of loop over leagues
      { :year => year, :leagues => leagues }
    end

    puts "Parsed seasons document of size #{seasons.size}"
    
    ## Now loop over the objects retrieved from the XML and build corresponding model objects
    seasons.each do |season|
      @season = Season.new( { :year => season[ :year ] } )
      if @season.save 
        season[ :leagues ].each do |league|
          @league = @season.leagues.create( { :leagueName => league[ :leagueName ] } )
          if @league.save
            league[ :divisions ].each do |division|
              @division = @league.divisions.create( { :divisionName => division[ :divisionName ] } )
              if @division.save
                division[ :teams ].each do |team|
                  @team = @division.teams.create( { :teamName => team[ :teamName ], :teamCity => team[ :teamCity ] } )
                  if @team.save
                    team[ :players ].each do |player|
                      ## Player may be nil: if player is a pitcher, there are none of the following statistics!
                      if player
                        ## Calculate the derived stats
                        ##   Batting average
                        atBats = player[ 'AT_BATS' ].to_i
                        hits   = player[ 'HITS'    ].to_i
                        if atBats > 0
                          avg = hits.to_f / atBats.to_f
                        else
                          avg = 0.0
                        end
                        ##   Total bases
                        doubles  = player[ 'DOUBLES' ].to_i
                        triples  = player[ 'TRIPLES' ].to_i
                        homeRuns = player[ 'HOME_RUNS' ].to_i
                        totalBases = hits + doubles + (2*triples) + (3*homeRuns)

                        ##   Slugging percentage
                        if atBats > 0
                          slg = totalBases.to_f / atBats.to_f
                        else
                          slg = 0.0
                        end
                        
                        ##   On base percentage
                        walks          = player[ 'WALKS' ].to_i
                        beans          = player[ 'HIT_BY_PITCH' ].to_i
                        sacrificeFlies = player[ 'SACRIFICE_FLIES' ].to_i
                        denominator    = atBats + walks + sacrificeFlies + beans
                        numerator      = hits + walks + beans
                        if denominator > 0 
                          obp = numerator.to_f / denominator.to_f 
                        else
                          obp = 0.0
                        end
                        
                        ##   OPS
                        ops = obp + slg
                        
                        @player = @team.players.create( { :surName        => player[ 'SURNAME'         ], :givenName  => player[ 'GIVEN_NAME' ],
                                                          :atBats         => player[ 'AT_BATS'         ], :runs       => player[ 'RUNS'       ],
                                                          :hits           => player[ 'HITS'            ], :homeRuns   => player[ 'HOME_RUNS'  ],
                                                          :rbi            => player[ 'RBI'             ], :steals     => player[ 'STEALS'     ],
                                                          :sacrificeFlies => player[ 'SACRIFICE_FLIES' ], :walks      => player[ 'WALKS'      ],
                                                          :beans          => player[ 'HIT_BY_PITCH'    ], :doubles    => player[ 'DOUBLES'    ],
                                                          :triples        => player[ 'TRIPLES'         ], :totalBases => totalBases, 
                                                          :avg            => avg,                         :slg        => slg, 
                                                          :obp            => obp,                         :ops        => ops } )
                        if !@player.save
                          puts "Could not create player object for #{player}"
                        end
                      end
                    end ## End loop over players
                  end 
                end ## End loop over teams
              end 
            end ## End loop over divisions
          end
        end ## End loop over leagues
      end
    end ## End loop over seasons
    puts "That's it! Database populated"
  end
  
end
