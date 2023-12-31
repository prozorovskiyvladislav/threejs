import { useState } from "react";
import {AnimatePresence, motion} from "framer-motion";
import {useSnapshot} from "valtio";
import state from "../store";
import { reader } from "../config/helpers";
import { EditorTabs, FilterTabs, DecalTypes } from "../config/constants";
import { fadeAnimation, slideAnimation } from "../config/motion";
import { ColorPicker, Tab, AIPicker, CustomButton, FilePicker } from "../components";
import config from "../config/config";

const Customizer: React.FC = () => {
    const snap = useSnapshot(state);

    const [file, setFile] = useState<File>();
    const [prompt, setPrompt] = useState('');
    const [generatingImg, setGeneratingImg] = useState(false);
    const [activeEditorTab, setActiveEditorTab] = useState("");
    const [activeFilterTab, setActiveFilterTab] = useState({
        logoShirt: true,
        stylishShirt: false
    });
    const handleSubmit = async(type: string) => {
        if(!prompt) return alert("Please enter a prompt")

        try {
            setGeneratingImg(true);
            const response = await fetch(config.production.backendUrl, {
                method: "POST",
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    prompt
                })
            })
            const data = await response.json();
            handleDecals(type, `data:image/png;base64,${data.photo}`)
        } catch (error) {
            alert(error)
        } finally {
            setGeneratingImg(false);
            setActiveEditorTab("");
        }
    }
    const generateTabContent = () => {
        switch (activeEditorTab) {
            case 'colorpicker':
                return <ColorPicker />
            case 'filepicker':
                return <FilePicker file={file} setFile={setFile} readFile={readFile} />
            case 'aipicker':
                return <AIPicker
                    prompt={prompt}
                    setPrompt={setPrompt}
                    generatingImg={generatingImg}
                    handleSubmit={handleSubmit}
                />
            default:
                return null
        }
    }

    const handleClickActiveEditorTab = (tab: string) => {
        if(tab === activeEditorTab) {
            setActiveEditorTab('');
        } else {
            setActiveEditorTab(tab);
        }
    }
    const handleActiveFilterTab = (tabName: string) => {
        switch (tabName) {
            case 'logoShirt':
                state.isLogoTexture = !activeFilterTab[tabName];
                break;
            case 'stylishShirt':
                state.isFullTexture = !activeFilterTab[tabName];
                break;
            default:
                state.isFullTexture = false;
                state.isLogoTexture = true;
                break;
        }
        setActiveFilterTab(prevState => ({
            ...prevState,
            [tabName]: !prevState[tabName]
        }))
    }
    const handleDecals = (type: string, result: string) => {
        const decalType = DecalTypes[type];
        state[decalType.stateProperty] = result;
        if(!activeFilterTab[decalType.filterTab]) {
            handleActiveFilterTab(decalType.filterTab)
        }
    }
    const readFile = (type: string) => {
        reader(file).then(result => {
            handleDecals(type,result);
            setActiveEditorTab("")
          })
    }

    return (
        <AnimatePresence>
            {!snap.intro && (
                <>
                    <motion.div key="custom" className="absolute top-0 left-0 z-10" {...slideAnimation('left')} >
                        <div className="flex items-center min-h-screen">
                            <div className="editortabs-container tabs">
                                {EditorTabs.map((tab) => <Tab key={tab.name} tab={tab} handleClick={() => handleClickActiveEditorTab(tab.name)}/>)}
                                {generateTabContent()}
                            </div>
                        </div>
                    </motion.div>
                    <motion.div className="absolute z-10 top-5 right-5" {...fadeAnimation}>
                        <CustomButton type="filled" title="Go back" handleClick={() => state.intro = true} customStyles="w-fit px-4 py-2.5 font-bold text-sm"/>
                    </motion.div>
                    <motion.div className="filtertabs-container" {...slideAnimation('up')}>
                        {FilterTabs.map((tab) => <Tab isFilterTab isActiveTab={activeFilterTab[tab.name]} key={tab.name} tab={tab} handleClick={() => handleActiveFilterTab(tab.name)}/>)}
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
};

export default Customizer;