class Page extends React.Component {
  constructor() {
    super();

    this.state = {
      isLoading: true,
      error: null,
      template: [],
      slug: ""
    }

    this.handleNavigation = this.handleNavigation.bind(this);
  }

  componentDidMount() {
    // Create an event listener for browser navigation
    window.addEventListener("popstate", this.handleNavigation);
    // Load the current page into state
    this.handleNavigation();
  }

  handleNavigation(event){
    // Set the page to loading display
    this.setState({isLoading: true})
    // Update state template to reflect current page slug
    this.setState({
      slug: getSlug()
    })
  }

  render() {
    return (
      <div>
        <h1>{this.state.slug}</h1>
      </div>
    )
  }
}

ReactDOM.render (
  <Page />,
  document.getElementById('content')
);
