import React from 'react';
import FA from 'react-fontawesome';

class Authorization extends React.Component {
    async componentDidMount() {
        let props = this.props;
        console.log("Auth Props", props);
        if(!props.development) {
            await props.checkAuthentication();
            if(!props.authenticated) {
                console.log("not authenticated", props);
                return setTimeout(() => {
                    return window.location = "/login?returnUrl=/config";
                }, 5000);
            }
            if(!props.iaaAuth)
            {
                console.log("not IAA", props);
                return setTimeout(() => {
                   return window.location = props.iaaCheck; 
                }, 5000)
                
            }
        }
    }
    render() {
        return (
            <div>
                This is the loading page. Checking auth. <FA name="spinner" spin={true} /> 
            </div>          
        )
    }
}

export default Authorization;