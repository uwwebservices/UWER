import React from 'react';
import FA from 'react-fontawesome';

class Authorization extends React.Component {
   componentDidMount() {
        this.props.checkAuthentication();
    }
    render() {
        const { loginRequired, authenticated, development, iaaAuth, iaaCheck, iaaRequired, children } = this.props;

        if(authenticated !== null && iaaAuth !== null) {
            // need to wait for authenticated and iaaAuth to get back...
            if(loginRequired && !authenticated) {
                window.location = `/login?returnUrl=${this.props.path}`;
            }
            console.log("iaa", iaaRequired, iaaAuth)
            if(iaaRequired && !iaaAuth) {
                window.location = iaaCheck; 
            }
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