import * as AVRO from "avsc";
import React, { createContext, useContext, useMemo, useEffect, useState } from "react";
import { AvroParser } from "../utils/AvroParser";

interface ContextState {
    namespaces: string[];
    namespaceTree: Map<string, string[]>;
    schemas: Map<string, any>;
}

const initialState = {
    namespaces: [],
    namespaceTree: new Map(),
    schemas: new Map(),
};

const DataContext = createContext<[ContextState]>(
    [initialState],
);

export const DataProvider = (props: any): JSX.Element => {
    const [appData, setAppData] = useState<ContextState>(initialState);
    const value = useMemo(() => [appData], [appData]);

    const readSchemas = async () => {
        // @ts-ignore
        const schema1 = await import("../avro/user.json");
        const schema2 = await import("../avro/persons.json");
        const schema3 = await import("../avro/BalanceAdjustment.json");
        const schema4 = await import("../avro/ComplexRecord.json");
        const schema5 = await import("../avro/CommUpdateType.json");

        const parsed1 = AVRO.parse(JSON.stringify(schema1));
        const parsed2 = AVRO.parse(JSON.stringify(schema2));
        const parsed3 = AVRO.parse(JSON.stringify(schema3));
        const parsed4 = AVRO.parse(JSON.stringify(schema4));
        const parsed5 = AVRO.parse(JSON.stringify(schema5));
        // const parsedExampleWMessage = AVRO.parse(JSON.stringify(schema3));

        const records = new Map<string, any>();
        AvroParser.GetAllRecords(parsed1, records);
        AvroParser.GetAllRecords(parsed1, records);
        AvroParser.GetAllRecords(parsed1, records);
        AvroParser.GetAllRecords(parsed2, records);
        AvroParser.GetAllRecords(parsed3, records);
        AvroParser.GetAllRecords(parsed4, records);
        AvroParser.GetAllRecords(parsed5, records);

        const namespaces = Array.from(records.keys());
        const namespaceTree = new Map<string, string[]>();
        const schemas = new Map<string, any>();

        namespaces.forEach(namespace => {
            // namespaceTree.add(namespace.substring(0, namespace.lastIndexOf(".")));
            const parent = namespace.substring(0, namespace.lastIndexOf("."));
            const child = namespace.substring(namespace.lastIndexOf(".") + 1);
            const children = namespaceTree.get(parent) || [];
            children.push(child);
            namespaceTree.set(parent, children);

            schemas.set(namespace.toLowerCase(), records.get(namespace));
        });

        setAppData({
            namespaceTree: namespaceTree,
            namespaces: namespaces,
            schemas: schemas,
        });
    };

    useEffect((): any => {
        readSchemas();
    }, []);

    return (
        <DataContext.Provider value={value} {...props}>
            {props.children}
        </DataContext.Provider>
    );
};

export function useDataContext(): [ContextState] {
    const context = useContext(DataContext);
    if (context === undefined) {
        throw new Error("DataContext must be used within a DataProvider");
    }
    return context;
}
