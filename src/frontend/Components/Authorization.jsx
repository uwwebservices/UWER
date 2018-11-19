import React from 'react';
import FA from 'react-fontawesome';

class Authorization extends React.Component {
   componentDidMount() {
        this.props.checkAuthentication();
    }
    render() {
        const { loginRequired, authenticated, development, iaaAuth, iaaCheck, iaaRequired, children } = this.props;

        if(authenticated !== null && iaaAuth !== null) {
            if(loginRequired && !authenticated) {
                window.location = `/login?returnUrl=${this.props.path}`;
            }
            // this isn't working as expected...seems to always be false
            if(iaaRequired && !iaaAuth) {
                window.location = iaaCheck; 
            }
        }
       
        // this needs some tweaking
        let shouldRenderChildren = development || (authenticated !== null && ((iaaRequired && iaaAuth) && authenticated));
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