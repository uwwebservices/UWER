import React from 'react';
import FA from 'react-fontawesome';

class Authorization extends React.Component {
   componentDidMount() {
        this.props.checkAuthentication();
    }
    render() {
        const { loginRequired, authenticated, development, iaaAuth, iaaCheck, iaaRequired, children } = this.props;

        console.log("auth", loginRequired, authenticated)

        // need to wait for authenticated and iaaAuth to get back...
        if(loginRequired && !authenticated) {
            console.log("not logged in, authenticating");
            // return setTimeout(() => {
            //     return window.location = "/login?returnUrl=/config";
            // }, 5000);
        }
        console.log("iaa", iaaRequired, iaaAuth)
        if(iaaRequired && !iaaAuth) {
            // return setTimeout(() => {
            //     return window.location = iaaCheck; 
            // }, 5000)
        }

        let shouldRenderChildren = development || (iaa && auth);
        
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