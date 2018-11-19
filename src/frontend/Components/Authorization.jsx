import React from 'react';
import FA from 'react-fontawesome';

class Authorization extends React.Component {
   componentDidMount() {
        this.props.checkAuthentication();
    }
    render() {
        const { loginRequired, authenticated, development, iaaAuth, iaaCheck, iaaRequired, children } = this.props;

        if(!development) {
        // before checkAuth has returned, auth/iaa are set to null, once returned they are true/false
        // maker sure checkAuth has returned before shipping someone off to shib/iaa
            if(authenticated !== null && iaaAuth !== null) {
                if(loginRequired && !authenticated) {
                    console.log("redirecting to login");
                    window.location = `/login?returnUrl=${this.props.path}`;
                }
                
                if(authenticated && iaaRequired && !iaaAuth) {
                    console.log("redirecting to idaa");
                    window.location = iaaCheck; 
                }
            }
        }
       
        let shouldRenderChildren = ((iaaRequired && iaaAuth) && authenticated);

        shouldRenderChildren = authenticated === null ? false : shouldRenderChildren; // initial load, auth is null, wait for checkAuth to return
        //shouldRenderChildren = development ? true : shouldRenderChildren; // local dev mode

        console.log("ShouldRenderChildren?", shouldRenderChildren);
        console.log("loginRequired", loginRequired);
        console.log("development", development);
        console.log("authenticated", authenticated);
        console.log("iaaRequired", iaaRequired);
        console.log("iaaAuth", iaaAuth);
        
        return (
            shouldRenderChildren ? (
                children
            ) : (
                <div>
                    This is the loading page. Checking auth. <FA name="spinner" spin={true} />
                </div> 
            )
        )
    }
}

export default Authorization;