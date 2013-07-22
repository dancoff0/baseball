// Main javascript file

// This method implements the initial page load.
function initPage()
{
  // Clear any selectors
  //console.log( "Clearing tags" );
  selectors = document.getElementsByTagName( "SELECT" );
  //console.log( "Got selectors " + selectors );
  for( var i = 0; i < selectors.length; i++ )
  {
    selectors[ i ].selectedIndex = -1;
  }

  // Set up the column headers
  var statTable = document.getElementById( "StatTable" );

  // Create a mapping from stat type to column header
  var headerMap = {};
  headerMap[ "avg"      ] = document.getElementById( "AVGHeader"  );
  headerMap[ "homeRuns" ] = document.getElementById( "HRHeader"   );
  headerMap[ "rbi"      ] = document.getElementById( "RBIHeader"  );
  headerMap[ "runs"     ] = document.getElementById( "RUNSHeader" );
  headerMap[ "steals"   ] = document.getElementById( "SBHeader"   );
  headerMap[ "ops"      ] = document.getElementById( "OPSHeader"  );
  statTable.headerMap = headerMap;
  
  // Set the name of the statistic in each header element. Add the onClick handler.
  for( key in headerMap )
  {
    headerMap[ key ].statType         = key;
    headerMap[ key ].currentDirection = undefined;
    headerMap[ key ].playersFetched   = { "Ascending" : false, "Descending" : false };
    headerMap[ key ].onclick          = headerOnClickClosure( headerMap[ key ], statTable );
    //console.log( "headerMap element for " + key + " = " + headerMap[key] + ", with onclick = " + headerMap[key].onclick );
  }

  // Disable the 'onClick' handlers, initially, until data is fetched.
  statTable.headerClickEnabled = false;
}

function headerOnClickClosure( header, table )
{
  return function( event )
  {
    //console.log( "header onClick handler called" );
    // First check if the 'onClick' handlers are enabled.
    if( !table.headerClickEnabled ) return;

    // Get the event if this browser is IE.
    if( !event ) event = window.event;

    // Get the criterion  and ...
    var criterion        = header.statType;
 
    // ... the desired direction.  If this first time, assume that it is Descending.
    var desiredDirection = header.currentDirection ? (header.currentDirection == "Descending" ? "Ascending" : "Descending") : "Descending";
    //console.log( "Displaying data for " + criterion + ", sorted in the " + desiredDirection + " direction" );

    // Turn off the onClick handler.  It will be turned back on after the data is fetched and displayed.
    table.headerClickEnabled = false;

    // Check if we need to fetch this data.
    var needToFetch      = !header.playersFetched[ desiredDirection ];
    //console.log( "needToFetch = " + needToFetch );
    if( needToFetch )
    {
     // console.log( "We need to fetch this data" );
      // Fetch the data in a timeout so that we are not handling a complex operation in the event handling thread.
      var fetchAndDisplayDataCallback = fetchAndDisplayDataClosure( criterion, desiredDirection );
      setTimeout( fetchAndDisplayDataCallback, 10 );
    }
    else
    {
      //console.log( "We need to sort and display this data" );
      var statTable = document.getElementById( "StatTable" );
      var headerMap = statTable.headerMap;
      var players   = statTable.players;

      // Now sort the list of players and display it.
      var statArray = [];
      for( key in players )
      {
        currentPlayer = players[ key ];
        if( !key instanceof Number ) continue;
        statArray.push( [ currentPlayer[ criterion ], currentPlayer.id ] );
      }
      //console.log( "statArray has size " + statArray.length + " for criterion " + criterion );

      // Now sort the array and ...
      sortStat( statArray, desiredDirection );
      //for( var i = 0; i < 25; i++ )
      //{
      //  console.log( i + ": = " + statArray[i] );
      // }
      // ... use it as an array of keys
      displayStats( statArray, criterion, desiredDirection );
      statTable.headerClickEnabled = true;
    }
  };
}

function fetchAndDisplayDataClosure( criterion, direction )
{
  return function()
  {
    // console.log( "Beginning to fetch data for " + criterion + ", in the " + direction + " direction" );
    fetchStatsForCriterion( criterion, direction );
  };
}
    
function handleYearSelection( option )
{
  //console.log( "Got Request for year " + option.value );
  // Formulate a request to the server for the leagues.
  requestObject = new XMLHttpRequest();
  var url = io.getWebAppRootPath() + "seasons/" + option.value + "/leagues";
  //console.log( "url is " + url );
  dispatchGET( requestObject, url, handleYearSelectionResponse );
}

function handleYearSelectionResponse( leagues )
{
  //console.log( "handleYearSelectionResponse: got response " + leagues );

  // Get the League selector
  var leagueSelector = document.getElementById( "LeagueSelector" );

  // Remove any current options
  var leagueOptions = leagueSelector.options.length;
  if( leagueOptions > 0 )
  {
    for( var i = leagueOptions - 1; i >= 0; i-- )
    {
      leagueSelector.remove( i );
    }
  }
  
  var option = new Option();
  option.value    = "0";
  option.text     = "All Leagues";
  option.selected = true;
  leagueSelector.add( option, null );
  for( var i = 0; i < leagues.length; i++ )
  {
    
    var option = new Option();
    option.value = leagues[i].id;
    option.text  = leagues[i].leagueName;
    leagueSelector.add( option, null );
  }

  // Enable this selector
  leagueSelector.disabled = false;

  // Enable the View button
  document.getElementById( "StatFetcherButton" ).disabled = false;
    
  
}

function handleLeagueSelection( option )
{
  //console.log( "Got Request for league " + option.value );
  // Get the selected year
  var yearSelector = document.getElementById( "YearSelector" );
  var selectedYear = yearSelector.options[ yearSelector.selectedIndex ].value;

  // Formulate a request to the server for the leagues.
  requestObject = new XMLHttpRequest();
  var url = io.getWebAppRootPath() + "seasons/" + selectedYear + "/leagues/" + option.value + "/divisions";
  //console.log( "url is " + url );
  dispatchGET( requestObject, url, handleLeagueSelectionResponse );
}

function handleYearSelectionResponse( leagues )
{
  //console.log( "handleYearSelectionResponse: got response " + leagues );

  // Get the League selector
  var leagueSelector = document.getElementById( "LeagueSelector" );

  // Remove any current options
  var leagueOptions = leagueSelector.options.length;
  if( leagueOptions > 0 )
  {
    for( var i = leagueOptions - 1; i >= 0; i-- )
    {
      leagueSelector.remove( i );
    }
  }
  
  var option = new Option();
  option.value    = "0";
  option.text     = "All Leagues";
  option.selected = true;
  leagueSelector.add( option, null );
  for( var i = 0; i < leagues.length; i++ )
  {
    
    var option = new Option();
    option.value = leagues[i].id;
    option.text  = leagues[i].leagueName;
    leagueSelector.add( option, null );
  }

  // Enable this selector
  leagueSelector.disabled = false;

  // Enable the View button
  document.getElementById( "StatFetcherButton" ).disabled = false;
}

function handleLeagueSelectionResponse( divisions )
{
  //console.log( "handleLeagueSelectionResponse: got response " + divisions );

  // Get the Division selector
  var divisionSelector = document.getElementById( "DivisionSelector" );

  // Remove any current options
  var divisionOptions = divisionSelector.options.length;
  if( divisionOptions > 0 )
  {
    for( var i = divisionOptions - 1; i >= 0; i-- )
    {
      divisionSelector.remove( i );
    }
  }
  
  var option = new Option();
  option.value    = "0";
  option.text     = "All Divisions";
  option.selected = true;
  divisionSelector.add( option, null );
  for( var i = 0; i < divisions.length; i++ )
  {
    var option = new Option();
    option.value = divisions[i].id;
    option.text  = divisions[i].divisionName;
    divisionSelector.add( option, null );
  }

  // Enable this selector
  divisionSelector.disabled = false;

  // Enable the View button
  document.getElementById( "StatFetcherButton" ).disabled = false;
}

function fetchNamesOfTeams( followUp )
{
  // Get the selected year.
  var yearSelector = document.getElementById( "YearSelector" );
  var selectedYear = yearSelector.options[ yearSelector.selectedIndex ].value;

  // Now construct the url
  var url = io.getWebAppRootPath() + "seasons/" + selectedYear + "/teams";

  //console.log( "Fetching teams from url " + url );

  // Remove any previous teams as this is a new start.
  var statTable = document.getElementById( "StatTable" );
  if( statTable.teams ) delete statTable.teams;
  statTable.teams = undefined;
  
  // Issue the fetch
  requestObject = new XMLHttpRequest();
  var handler = function( followUp ){ return function( response ){ handleFetchedTeams( response, followUp ); }}( followUp );
  //console.log( "handler is " + handler );
  dispatchGET( requestObject, url, handler );
}

function handleFetchedTeams( newTeams, followUp )
{
  //console.log( "Got list of teams: " + newTeams );
  // Got new list of teams
  var teams = {};
  for( var i = 0; i < newTeams.length; i++ )
  {
    var currentTeam = newTeams[ i ];
    teams[ currentTeam.id ] = currentTeam.teamCity + " " + currentTeam.teamName;
  }
  /*
  for( key in teams )
  {
    console.log( "Team " + key + " = " + teams[ key ] );
  }
  */
  var statTable = document.getElementById( "StatTable" );
  statTable.teams = teams;

  // Now do any chained operation
  if( followUp ) followUp();
}


// Initial fetch of stats
function fetchStats()
{
  // Get the values of the year, league and division selectors
  //console.log( "Initially fetching stats" );
  var statTable = document.getElementById( "StatTable" );
  var teams     = statTable.teams;
  if( !teams )
  {
    // Need to fetch the names of the teams first, the call back to this method again.
    fetchNamesOfTeams( fetchStats );
    return;
  }

  // Get the selected year
  var yearSelector = document.getElementById( "YearSelector" );
  var selectedYear = yearSelector.options[ yearSelector.selectedIndex ].value;

  // Get the selected league, if any
  var leagueSelector   = document.getElementById( "LeagueSelector" );
  var selectedLeague   = undefined;
  var selectedDivision = undefined;
  if( !leagueSelector.disabled )
  {
    selectedLeague = leagueSelector.options[ leagueSelector.selectedIndex ].value;
    //console.log( "comparing: selectedLeague = " + selectedLeague );
    if( selectedLeague == "0" )
    {
      //console.log( "Resetting selectedLeague" );
      selectedLeague = undefined;
    }
    else
    {
      var divisionSelector = document.getElementById( "DivisionSelector" );
      if( !divisionSelector.disabled )
      {
        selectedDivision = divisionSelector.options[ divisionSelector.selectedIndex ].value;
        if( selectedDivision == "0" ) selectedDivision = undefined;
      }
    }
  }
  //console.log( "Selected Year     = " + selectedYear     );
  //console.log( "Selected League   = " + selectedLeague   );
  //console.log( "Selected Division = " + selectedDivision );
 
  // Now construct the url
  var url = io.getWebAppRootPath() + "seasons/" + selectedYear;
  if( selectedLeague )
  {
    url += "/leagues/" + selectedLeague;
  }
  if( selectedDivision )
  {
    url += "/divisions/" + selectedDivision;
  }

  // Save the base URL
  statTable.baseURL = url;

  url += "/avg/desc";
  
  //console.log( "url is " + url );

  // Remove any previous players as this is a new start.
  if( statTable.players ) delete statTable.players;
  statTable.players = undefined;
  var headerMap     = statTable.headerMap;
  for( key in headerMap )
  {
    headerMap[ key ].currentDirection = undefined;
    headerMap[ key ].playersFetched   = { "Ascending" : false, "Descending" : false };
  }
  
  // Issue the fetch
  requestObject = new XMLHttpRequest();
  dispatchGET( requestObject, url, handleFetchedStats );
}

// Subsequent fetches
function fetchStatsForCriterion( criterion, direction )
{
  // Get the values of the year, league and division selectors
  //console.log( "Fetching stats" );
  var statTable = document.getElementById( "StatTable" );
 
  // Now construct the url
  var url = statTable.baseURL + "/" + criterion;
  if( direction == "Ascending" ) url += "/asc";
  else                           url += "/desc";

  //console.log( "url is " + url );

  // Issue the fetch
  requestObject = new XMLHttpRequest();
  dispatchGET( requestObject, url, handleFetchedStats );
}

// This is the main handler for all returned stats.
function handleFetchedStats( response )
{
  // Get the criterion and direction
  var criterion = response.criterion;
  var direction = response.direction;

  // Get the players
  var newPlayers = response.players;
  //console.log( "Got " + newPlayers.length + " new players");

  // Merge in the new players
  var statTable = document.getElementById( "StatTable" );
  var players   = statTable.players;
  if( !players )
  {
    statTable.players = {};
    players = statTable.players;
    /*
    players.size = function()
    {
      var size = 0, key;
      for( key in this )
      {
       if( this.hasOwnProperty( key ) ) size++;
      }
      return size;
    };
    */
    
  }
  for( var i = 0; i < newPlayers.length; i++ )
  {
    var currentPlayer = newPlayers[i];
    players[ currentPlayer.id ] = currentPlayer;
  }

  // Indicate the we have now fetched the data for this criterion and direction
  var headerMap = statTable.headerMap;
  headerMap[ criterion ].playersFetched[ direction ] = true;
  //console.log( "Players now has " + players.size() + " entries" );
  /*
  var i = 0;
  for( var key in players )
  {
    console.log( "key " + (i++) + ": " + key );
  }
  */
  // Now sort the list of players and display it.
  var statArray = [];
  for( key in players )
  {
    currentPlayer = players[ key ];
    if( !key instanceof Number ) continue;
    statArray.push( [ currentPlayer[ criterion ], currentPlayer.id ] );
  }
  //console.log( "statArray has size " + statArray.length + " for criterion " + criterion );

  // Now sort the array and ...
  sortStat( statArray, direction );
  //for( var i = 0; i < 25; i++ )
  //{
  //  console.log( i + ": = " + statArray[i] );
  // }
  // ... use it as an array of keys
  displayStats( statArray, criterion, direction );
  statTable.headerClickEnabled = true;
}

function displayStats( statArray, criterion, direction )
{
  var statTable = document.getElementById( "StatTable" );
  var players   = statTable.players;

  // Sanity check 
  if( !players ) return;

  // Get a reference to the old body
  var oldTbody = statTable.getElementsByTagName( "TBODY" )[0];
  //console.log( "oldTbody = " + oldTbody );

  // Display at most 25 rows.
  var numberOfRows = statArray.length < 25 ? statArray.length : 25;

  // Make up a new body and populate it.
  var newTbody = document.createElement( "TBODY" );
  
  for( var i = 0; i < numberOfRows; i++ )
  {
    var playerID      = statArray[i][1];
    var currentPlayer = players[ playerID ];
    //if( i == 0 )
   // {
    //  for( key in currentPlayer )
    //  {
    //    console.log( "currentPlayer has " + currentPlayer[ key ] + " for " + key );
    //  }
   // }
    var newRow        = document.createElement( "TR" );
    if( i % 2 == 1 )
    {
      newRow.className = "EvenRow";
    }
    
    // Player name
    var playerCell       = document.createElement( "TD" );
    playerCell.className = "PlayerColumn";
    var playerSpan = document.createElement( "SPAN" );
    playerSpan.className = "PlayerSpan";
    playerSpan.appendChild( document.createTextNode( currentPlayer.givenName + " " + currentPlayer.surName ) );  
    playerCell.appendChild( playerSpan );
    newRow.appendChild( playerCell );

    // Team name
    var teamCell = document.createElement( "TD" );
    teamCell.className = "TeamColumn";
    //console.log( "team-id = " + currentPlayer[ "team_id" ] );
    teamCell.appendChild( document.createTextNode( statTable.teams[ currentPlayer[ "team_id" ] ] ) );
    newRow.appendChild( teamCell );

    // Batting average
    var avgCell       = document.createElement( "TD" );
    avgCell.className = "StatColumn";
    avgCell.appendChild( document.createTextNode( fixFloat( currentPlayer.avg, 3 ) ) );
    newRow.appendChild( avgCell );

    // Home runs
    var hrCell       = document.createElement( "TD" );
    hrCell.className = "StatColumn";
    hrCell.appendChild( document.createTextNode( currentPlayer.homeRuns ) );
    newRow.appendChild( hrCell );

    // Runs batted in
    var rbiCell         = document.createElement( "TD" );
    rbiCell.className   = "StatColumn";
    rbiCell.appendChild( document.createTextNode( currentPlayer.rbi  ) ) ;
    newRow.appendChild( rbiCell );

    // Runs cell
    var runsCell       = document.createElement( "TD" );
    runsCell.className = "StatColumn";
    runsCell.appendChild( document.createTextNode( currentPlayer.runs ) );
    newRow.appendChild( runsCell );

    // Stolen bases
    var sbCell       = document.createElement( "TD" );
    sbCell.className = "StatColumn";
    sbCell.appendChild( document.createTextNode( currentPlayer.steals ) );
    newRow.appendChild( sbCell );

    // OPS
    var opsCell       = document.createElement( "TD" );
    opsCell.className = "StatColumn";
    opsCell.appendChild( document.createTextNode( fixFloat( currentPlayer.ops, 3 ) ) );
    newRow.appendChild( opsCell );

    newTbody.appendChild( newRow );
  }
  
  // Now replace the old body
  oldTbody.parentNode.replaceChild( newTbody, oldTbody );

  // Change the headers as appropriate
  var headerMap = statTable.headerMap;

  // First reset the styles
  for( key in headerMap )
  {
    if( headerMap[ key ].originalClassName ) headerMap[key].className = headerMap[key].originalClassName;
    headerMap[ key ].currentDirection = undefined;
  }
  var selectedHeader               = headerMap[ criterion ];
  selectedHeader.originalClassName = selectedHeader.className;
  selectedHeader.className        += " SortedColumn " + direction;
  selectedHeader.currentDirection  = direction;
  selectedHeader.playersFetched[ direction ] = true;
}

function sortStat( statArray, direction )
{
  if( direction == "Ascending" )
  {
    statArray.sort( function( a, b ){ return a[0] - b[0] } );
  }
  else
  {
    statArray.sort( function( a, b ){ return b[0] - a[0] } );
  }
}

function fixFloat( x, precision )
{
  return (Math.round( x*100.0 )/100.0).toFixed( precision );
}

function dispatchGET( request, url, handler )
{
  // Sanity check
  if( !url || url.length == 0 ) return;

  // Apply a timestamp to the end of the URL to defeat the cache policy.
  if( url.indexOf( '?') > 0 ) url += '&timestamp=' + new Date().getTime();
  else                        url += '?timestamp=' + new Date().getTime();
      
  // Set up the 'GET'
  request.open( "GET", url, true );
  request.setRequestHeader("Accept", "application/json" );
  request.onreadystatechange = 
  function( handler )
  { 
    return function()
    {
      if( this.readyState == 4 )
      {
        if( this.status == 200 )
        {
          if( this.responseText )
          {
            try
            {
	      //console.log( "Got response text " + this.responseText );
              var responseObject = eval( "(" + this.responseText + ")" );
              //console.log( "responseObject = " + responseObject );
              handler( responseObject );
            }
            catch( e )
            {
              console.log( "baseball: dispatchGET: caught exception evaluating responseText: " + e );
              console.log( "baseball: dispatchGET: responseText was " + this.responseText );
            }
	  }
        }
      }
    };
  }( handler );
      
  request.send( null ); 
}


