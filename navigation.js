const lnkLen = [4, 5, 8, 7];

function sanitizeSlug(page) {
  // List allowed characters
  let whitelist = "abcdefghijklmnopqrstuvwxyz0123456789-";
  // Loop through slug characters and verify they are whitelisted
  for (let i = 0; i < page.length; i++) {
    if (!whitelist.includes(page.charAt(i))) {
      // Invalid slug
      return "home";
    }
  }
  // Valid slug
  return page;
}

function getSlug() {
  let address;
  // Get the final directory or hash of the url
  window.location.href.includes("#")
  ? address = window.location.href.split("#")  // split by hash
  : address = window.location.href.split("/"); // split by slash
  let page = address.pop();
  // Sanitize page slug with whitelist
  page = sanitizeSlug(page);
  // If empty make page home
  page == "" && (page = "home");
  return page;
}

// Generate string of random letters for the loading animation
function generateText(length) {
  var result = '';
  var characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  var charactersLength = characters.length;
  for ( let i = 0; i < length; i++ ) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
}

// Dispay loading text in place of a NavItem
function LoadItem(props) {
  return <li className="loadItem">
         <a href="#">{props.text}</a>
         </li>;
}

// Display a NavItem and its dropdown menu
function NavItem(props) {
  return <li className={props.active}>
           <a href={props.url} id={"nav"+props.id} title={props.title}>{props.text}</a>
           { props.dd.length > 0 &&
             (<ul>
               <NavList
                dd={props.dd}
                activeChild={props.activeChild}
               />
             </ul>)
           }
         </li>
}

// Dispay a NavItem's dropdown menu
function NavList(props) {
  return (
    props.dd.map(links => (
      <NavItem
        key = {links.id}
        id = {links.id}
        active = {links.id == props.activeChild ? "active" : "inactive"}
        url = {links.url} title = {links.title} text = {links.text} dd = {links.dd}
      />
    ))
  );
}


class NavBar extends React.Component {
  constructor() {
    super();

    this.state = {
      isLoading: true,     // false once json has loaded
      isBot: false,        // toggled by user agent or button
      navLinks: [],        // for displaying menu items
      linkLengths: lnkLen, // for loading animation
      active: 0,           // change class for current page
      activeChild: 0,      // change class for dd page
      slug: "",            // slug retrieved from url
      error: null          // loading error
    }

    // Toggle bot mode: showing # or permaLinks
    this.toggleBot = this.toggleBot.bind(this);
    // React to browser back/forward buttons
    this.handleNavigation = this.handleNavigation.bind(this);
    // Play the loading animation
    this.runAnimation = this.runAnimation.bind(this);
    // Generate random letters to animate loading
    this.animateLinks = this.animateLinks.bind(this);
    // When the nav bar is clicked, update display
    this.handleClick = this.handleClick.bind(this);
    // Get the JSON navigation info
    this.fetchLinks = this.fetchLinks.bind(this);
    // When a link is clicked
    this.updatePage = this.updatePage.bind(this);
    // Return the current page slug
    this.getActive = this.getActive.bind(this);
  }

  // Display a bot toggle buttons
  toggleBot() {
    this.setState({isBot: !this.state.isBot})
    this.state.isBot ? this.fetchLinks("navbar.json?v=0.13")
                     : this.fetchLinks("perm-navbar.json?v=0.04");
  }

  animateLinks(num) {
    // generate json for num links
    var self = this; // self needed to access this. in anonymous()
    let loaders = [];
    for (let i = 0; i < num; i++) {
      loaders[i] = {
        id: i,
        text: generateText(this.state.linkLengths[i])
      }
    }
    return loaders;
  }

  runAnimation() {
    var self = this; // self needed to access this. in anonymous()
    if (this.state.isLoading) {
      this.setState({navLinks: this.animateLinks(4)})
      setTimeout(function(){ self.runAnimation() }, 20);
    }
  }

  fetchLinks(location) {
    // Where we're fetching data from
    fetch(location)
      // We get the API response and receive data in JSON format...
      .then(response => response.json())
      // ...then we update the users state
      .then(data =>
        this.setState({
          navLinks: data,
          isLoading: false,
        })
      )
      // ...then we update the currenly active page displaying
      .then(this.getActive)

      // Catch any errors we hit and update the app
      .catch(error => this.setState({ error, isLoading: false }));
  }

  componentDidMount() {
    this.runAnimation();

    // Create an event listener for browser navigation
    window.addEventListener("popstate", this.handleNavigation);

    // Determine if mounted for a bot
    let agent = navigator.userAgent;
    let tags = ["bot", "crawl", "spider"];
    let isBot = false;

    for (let i = 0; i < tags.length; i++) {
      if (agent.indexOf(tags[i]) > 0) {
        isBot = true;
        this.state.isBot = true;
      }
    }

    if (isBot) {
      // Use permaLinks to help bots navigate
      this.fetchLinks("perm-navbar.json?v=0.04");
    } else {
      this.fetchLinks("navbar.json?v=0.13");
    }
  }

  updatePage() {
    // run getActive and retrieve page details [title, text]
    let details = this.getActive();
    let title = details[0];
    let text = details[1];

    // Add the new page to browser history
    window.history.replaceState(text, title, this.state.slug);
  }

  getActive() {
    this.setState({"slug": getSlug()});
    let links = this.state.navLinks;
    let page = "#"+this.state.slug;
    let active = null; let activeChild = null;
    let text = ""; let title = "";

    // Retrieve the link id given the active url and update state
    for (let i = 0; i < links.length; i++) {
      if (links[i].url === page) {
        active = links[i].id;
        activeChild = null;
        text = links[i].text;
        title = links[i].title;
        break;
      }
      // Loop through dropdown if it exists
      if (links[i].dd.length > 0) {
        for (let k = 0; k < links[i].dd.length; k++) {
          if (links[i].dd[k].url === page) {
            active = links[i].id;
            activeChild = links[i].dd[k].id;
            text = links[i].dd[k].text;
            title = links[i].dd[k].title;
            break;
          }
        }
      }
    }

    this.setState({"active": active, "activeChild": activeChild});
    let details = [text, title];
    return details;
  }

  handleClick(id) {
    // Hide the dropdown on hover off
    document.activeElement.blur()
    // Wait for the hash to be in the url, then update the page
    setTimeout(this.updatePage, 300)
  }

  handleNavigation(event) {
    let address = window.location.href.split("/");
    // Get the final directory of the url
    var page = address.pop();
    // If empty make page home
    !page && (page = "home");
    // Update on press of back/forward buttons
    if (event.state || (!event.state && page == "home")) {
      this.getActive();
    }
  }

  render() {
    const { isLoading, navLinks, active, activeChild, error } = this.state;
    return (
      <ul>
      <button onClick={() => this.toggleBot()}>
        Viewing as a {this.state.isBot ? "robot" : "human"}
      </button>
        {error ? <p>{error.message}</p> : null}
        {!isLoading ? (
          navLinks.map(links => {
          const { id, text, title, url, dd } = links;
          return (
            <div key={id} onClick={() => this.handleClick(id)}>
              <NavItem
                key={id}
                id={id}
                active={(id == active) ? "active" : "inactive"}
                activeChild={activeChild}
                url={url} title={title} text={text} dd={dd}
              />
            </div>
          );
        })
        // Show a loading animaton for NavItems
        ) : (
          navLinks.map(links => {
          const { id, text } = links;
          return (
            <LoadItem
              key={id}
              text={text}
            />
          )
        })
        )}
      </ul>
    );
  }
}

ReactDOM.render(
  <NavBar />,
  document.getElementById('navigation')
);
