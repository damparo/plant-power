import React, { useState } from "react";
import { Route, Switch, useHistory } from "react-router-dom";
import Scroll from "./components/scroll/scroll";
import "materialize-css/dist/css/materialize.min.css";
import Welcome from "./pages/index";
import NoMatch from "./pages/nomatch";
import Navbar from "./components/nav/index";
import API from "./utils/api";
import Results from "./pages/searchResults";
import Plant from "./pages/selectedPlant";
import NotFound from "./pages/notfound";
import AddMore from "./pages/addmore";
import User from "./pages/user";
import { useAuth0 } from "./react-auth0-spa";
import ExternalApi from "./components/views/ExternalApi";
import PrivateRoute from "react-private-route";
import "./App.css";

function App() {
    const { user } = useAuth0();
    const [results, setResults] = useState([]);
    const [search, setSearch] = useState("");
    const [userData, setUserData] = useState([]);

    const userPage = (e) => {
        e.preventDefault();
        if (user) {
            API.viewCollection(user.sub)
                .then((res) => {
                    if (res.data.length === 0) {
                        history.push("/addmore");
                    } else {
                        setUserData(res.data.searches);
                    }
                })
                .then(history.push("/user"));
        }
    };

    const handleInputChange = (event) => {
        const { value } = event.target;
        setSearch(value);
    };

    const history = useHistory();

    const handleFormSubmit = (event) => {
        event.preventDefault();
        API.getSearch(search)
            .then((res) => {
                if (res.data.length === 0) {
                    history.push("/notfound");
                } else {
                    setResults(res.data);
                }
            })
            .then(setSearch(""))
            .then(history.push("/results"))
            .catch((err) => console.log(err));
    };

    const [plantResults, setPlantResults] = useState([]);

    const cardClick = (id) => {
        let plant = {};
        let plantImage = {};
        let userId = {};
        let toxic = {};
        API.getPlant(id)
            .then((res) => {
                console.log(res.data);

                plant = {
                    name: res.data.common_name,
                    id: res.data.id,
                    type: res.data.duration,
                    shade: res.data.main_species.growth.shade_tolerance,
                    tempMin:
                        res.data.main_species.growth.temperature_minimum.deg_f,
                    drought: res.data.main_species.growth.drought_tolerance,
                    family: res.data.family_common_name,
                    water: res.data.main_species.growth.moisture_use,
                    fertility:
                        res.data.main_species.growth.fertility_requirement,
                };
                if (res.data.images[0]) {
                    plantImage = { image: res.data.images[0].url };
                }
                if (user) {
                    userId = { userid: user.sub };
                }
                if (res.data.main_species.specifications.toxicity) {
                    toxic = {
                        toxicity: res.data.main_species.specifications.toxicity,
                    };
                }
                let finalPlant = {
                    ...plant,
                    ...plantImage,
                    ...userId,
                    ...toxic,
                };
                setPlantResults(finalPlant);
            })
            .then(history.push("/plant"))
            .catch((err) => console.log(err));
    };

    return (
        <div>
            <Navbar
                handleInputChange={handleInputChange}
                handleFormSubmit={handleFormSubmit}
                search={search}
                userPage={userPage}
            />
            <div className="container">
                <div className="row">
                    <div className="col s12">
                        <Scroll>
                            <Switch>
                                <Route exact path={["/"]}>
                                    <Welcome />
                                </Route>
                                <Route exact path={"/user"}>
                                    <User
                                        userData={userData}
                                        cardClick={cardClick}
                                    />
                                </Route>
                                <PrivateRoute
                                    path="/external-api"
                                    component={ExternalApi}
                                />
                                <Route exact path={["/results"]}>
                                    <Results
                                        results={results}
                                        cardClick={cardClick}
                                    />
                                </Route>
                                <Route exact path={["/plant"]}>
                                    <Plant
                                        name={plantResults.name}
                                        image={plantResults.image}
                                        type={plantResults.type}
                                        shade={plantResults.shade}
                                        tempMin={plantResults.tempMin}
                                        drought={plantResults.drought}
                                        family={plantResults.family}
                                        water={plantResults.water}
                                        fertility={plantResults.fertility}
                                        userid={plantResults.userid}
                                        id={plantResults.id}
                                    />
                                </Route>
                                <Route exact path={"/notfound"}>
                                    <NotFound />
                                </Route>
                                <Route exact path={"/addmore"}>
                                    <AddMore />
                                </Route>
                                <Route>
                                    <NoMatch />
                                </Route>
                            </Switch>
                        </Scroll>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default App;
