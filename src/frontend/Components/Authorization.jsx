import React from 'react';
import FA from 'react-fontawesome';
import Button from '@material-ui/core/Button';

class Authorization extends React.Component {
    constructor() {
        super();
        this.state = { showRetry: false };
    }
    componentDidMount() {
        this.checkAuth();
    }
    checkAuth() {
        this.props.checkAuthentication();
    }
    render() {
        const { loginRequired, authenticated, development, iaaAuth, iaaCheck, iaaRequired, children, path } = this.props;

        // if we've been stuck on this page for 5s, give option to retry
        setTimeout(() => this.setState({showRetry: true}), 5000)

        if(!development) {
        // before checkAuth has returned, auth/iaa are set to null, once returned they are true/false
        // make sure checkAuth has returned before shipping someone off to shib/iaa
            if(authenticated !== null && iaaAuth !== null) {
                if(loginRequired && !authenticated) {
                    window.location = `/login?returnUrl=${path}`;
                }
                
                if(authenticated && iaaRequired && !iaaAuth) {
                    window.location = iaaCheck; 
                }
            }
        }
       
        let shouldRenderChildren = loginRequired ? authenticated : true;
        shouldRenderChildren = iaaRequired ? iaaAuth : true;
        shouldRenderChildren = authenticated === null || iaaAuth === null ? false : shouldRenderChildren; // initial load, auth is null, wait for checkAuth to return
        shouldRenderChildren = development ? true : shouldRenderChildren; // local dev mode
        
        return (
            shouldRenderChildren ? (
                children
            ) : (
                <div>
                    This is the loading page. Checking auth. <FA name="spinner" spin={true} /> <br />
                    { this.state.showRetry && (
                        <Button variant="raised" onClick={() => this.checkAuth()} color="primary" className="righty">Retry</Button>
                    )}
                </div> 
            )
        )
    }
}

export default Authorization;