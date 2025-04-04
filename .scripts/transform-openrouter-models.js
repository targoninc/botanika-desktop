import fs from 'fs';

const inputJson = JSON.parse(fs.readFileSync('input.json', 'utf8'));

// Map the models to the required format
const models = inputJson.data.models.map(model => ({
    id: model.slug,
    displayName: model.name,
    supportsTools: model.endpoint?.supports_tool_parameters || false,
}));

fs.writeFileSync('models.json', JSON.stringify(models, null, 2), (err) => {
    if (err) {
        console.error(err);
        return;
    }
    console.log('Models written to models.json');
});