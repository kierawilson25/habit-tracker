(globalThis.TURBOPACK = globalThis.TURBOPACK || []).push(["static/chunks/src_app_add-habit_page_tsx_abd6be._.js", {

"[project]/src/app/add-habit/page.tsx [app-client] (ecmascript)": ((__turbopack_context__) => {
"use strict";

var { r: __turbopack_require__, f: __turbopack_module_context__, i: __turbopack_import__, s: __turbopack_esm__, v: __turbopack_export_value__, n: __turbopack_export_namespace__, c: __turbopack_cache__, M: __turbopack_modules__, l: __turbopack_load__, j: __turbopack_dynamic__, P: __turbopack_resolve_absolute_path__, U: __turbopack_relative_url__, R: __turbopack_resolve_module_id_path__, b: __turbopack_worker_blob_url__, g: global, __dirname, k: __turbopack_refresh__, m: module, z: __turbopack_require_stub__ } = __turbopack_context__;
{
__turbopack_esm__({
    "default": (()=>AddHabits)
});
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_import__("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_import__("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_import__("[project]/node_modules/next/navigation.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2d$icons$2f$io$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_import__("[project]/node_modules/react-icons/io/index.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2d$icons$2f$hi2$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_import__("[project]/node_modules/react-icons/hi2/index.mjs [app-client] (ecmascript)");
;
var _s = __turbopack_refresh__.signature();
"use client";
;
;
;
;
;
function AddHabits() {
    _s();
    const router = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRouter"])();
    const [habits, setHabits] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])([]);
    const [habitDisabled, setHabitDisabled] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])([]);
    const [checkedStates, setCheckedStates] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])([]);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "AddHabits.useEffect": ()=>{
            // Get habits from session storage, or empty array if not found
            const stored = localStorage.getItem("habits");
            const habitList = stored ? JSON.parse(stored) : [];
            setHabits(habitList);
            setHabitDisabled(habitList.map({
                "AddHabits.useEffect": ()=>true
            }["AddHabits.useEffect"])); // All inputs start as disabled
            //IF a new habbit is added, the checked State should be added and set to false in local storage
            const storedChecked = localStorage.getItem("checkedStates");
            if (storedChecked && Array.isArray(JSON.parse(storedChecked))) {
                setCheckedStates(JSON.parse(storedChecked));
            }
        }
    }["AddHabits.useEffect"], []);
    // when the checked state changes, change the value in session storage
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "AddHabits.useEffect": ()=>{
            if (checkedStates.length != 0) {
                localStorage.setItem("checkedStates", JSON.stringify(checkedStates));
            }
        }
    }["AddHabits.useEffect"], [
        checkedStates
    ]);
    // when the habit changes, change the value in session storage
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "AddHabits.useEffect": ()=>{
            if (habits.length != 0) localStorage.setItem("habits", JSON.stringify(habits));
        }
    }["AddHabits.useEffect"], [
        habits
    ]);
    const handleChange = (idx, value)=>{
        setHabits((prev)=>prev.map((h, i)=>i === idx ? value : h));
    };
    /* handelEdit: Function to handle the edit/save functionality
    If the input is disabled, clicking the edit icon will enable it
    If the input is enabled, clicking the save icon will disable it */ const handleEdit = (idx, enabled)=>{
        // clicking the save icon, setting it to disabled
        if (enabled) {
            if (habits[idx].trim() === "") {
                alert("Habit cannot be empty. Delte it or add a value.");
            } else {
                setHabitDisabled((prev)=>prev.map((d, i)=>i === idx ? true : d));
                const input = document.querySelectorAll('input[type="text"]')[idx];
                input?.blur();
                const filtered = habits.filter((h)=>h.trim() !== "");
                setHabits(filtered);
            }
        } else {
            setHabitDisabled((prev)=>prev.map((d, i)=>i === idx ? false : d));
            // Focus the input for editing
            const input = document.querySelectorAll('input[type="text"]')[idx];
            input?.focus();
        }
    };
    const handleDelete = (idx)=>{
        setHabits((prev)=>prev.filter((_, i)=>i !== idx));
        setCheckedStates((prev)=>prev.filter((_, i)=>i !== idx));
    };
    const handleSubmit = (e)=>{
        e.preventDefault();
        router.push("/");
    };
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "flex justify-center px-4",
        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("form", {
            onSubmit: handleSubmit,
            className: "w-full max-w-2xl flex flex-col gap-4 p-8",
            children: [
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h1", {
                    className: "text-xl font-bold mb-4 text-center",
                    children: "Add up to 5 Habits"
                }, void 0, false, {
                    fileName: "[project]/src/app/add-habit/page.tsx",
                    lineNumber: 92,
                    columnNumber: 9
                }, this),
                habits.map((habit, idx)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "flex items-center gap-2",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                type: "text",
                                value: habit,
                                maxLength: 50,
                                placeholder: `Habit ${idx + 1}`,
                                onChange: (e)=>handleChange(idx, e.target.value),
                                disabled: habitDisabled[idx],
                                className: habitDisabled[idx] ? "bg-gray-300 text-gray-500 disabled focus:outline-none border p-2 rounded flex-1" : "border p-2 rounded text-black flex-1  hover:ring-2 hover:ring-green-500 focus:outline-none transition-colors duration-200"
                            }, void 0, false, {
                                fileName: "[project]/src/app/add-habit/page.tsx",
                                lineNumber: 98,
                                columnNumber: 13
                            }, this),
                            habit != "" && habitDisabled[idx] ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                type: "button",
                                className: "p-1 text-gray-500 hover:text-green-600",
                                onClick: ()=>handleEdit(idx, false),
                                "aria-label": "Edit habit",
                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2d$icons$2f$hi2$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["HiOutlinePencil"], {
                                    className: "h-5 w-5"
                                }, void 0, false, {
                                    fileName: "[project]/src/app/add-habit/page.tsx",
                                    lineNumber: 119,
                                    columnNumber: 17
                                }, this)
                            }, void 0, false, {
                                fileName: "[project]/src/app/add-habit/page.tsx",
                                lineNumber: 113,
                                columnNumber: 15
                            }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                        type: "button",
                                        className: "p-1",
                                        onClick: ()=>handleEdit(idx, true),
                                        "aria-label": "Save habit",
                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2d$icons$2f$io$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["IoIosCheckmarkCircle"], {
                                            className: "h-6 w-6 text-green-500 hover:text-green-800"
                                        }, void 0, false, {
                                            fileName: "[project]/src/app/add-habit/page.tsx",
                                            lineNumber: 129,
                                            columnNumber: 19
                                        }, this)
                                    }, void 0, false, {
                                        fileName: "[project]/src/app/add-habit/page.tsx",
                                        lineNumber: 123,
                                        columnNumber: 17
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                        type: "button",
                                        className: "p-1 text-gray-500 hover:text-blue-600",
                                        onClick: ()=>handleDelete(idx),
                                        "aria-label": "Delete habit",
                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2d$icons$2f$io$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["IoIosCloseCircleOutline"], {
                                            className: "h-6 w-6 hover:text-red-500"
                                        }, void 0, false, {
                                            fileName: "[project]/src/app/add-habit/page.tsx",
                                            lineNumber: 137,
                                            columnNumber: 19
                                        }, this)
                                    }, void 0, false, {
                                        fileName: "[project]/src/app/add-habit/page.tsx",
                                        lineNumber: 131,
                                        columnNumber: 17
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/app/add-habit/page.tsx",
                                lineNumber: 122,
                                columnNumber: 15
                            }, this)
                        ]
                    }, idx, true, {
                        fileName: "[project]/src/app/add-habit/page.tsx",
                        lineNumber: 97,
                        columnNumber: 11
                    }, this)),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "flex justify-end mt-6",
                    children: habits.length < 5 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                        type: "button",
                        onClick: ()=>{
                            if (habits.length < 5) {
                                setHabits([
                                    ...habits,
                                    ""
                                ]);
                                setHabitDisabled([
                                    ...habitDisabled,
                                    false
                                ]);
                                setCheckedStates((prev)=>[
                                        ...prev,
                                        false
                                    ]);
                            }
                        },
                        disabled: habits.length == 5,
                        className: "bg-green-600 hover:bg-green-800 text-white font-bold py-2 px-4 rounded-full transition-colors duration-200",
                        children: "+"
                    }, void 0, false, {
                        fileName: "[project]/src/app/add-habit/page.tsx",
                        lineNumber: 147,
                        columnNumber: 13
                    }, this)
                }, void 0, false, {
                    fileName: "[project]/src/app/add-habit/page.tsx",
                    lineNumber: 144,
                    columnNumber: 9
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "flex justify-center mt-6",
                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                        className: "bg-green-600 text-white rounded px-4 py-2 hover:bg-green-800 transition-colors duration-200",
                        type: "submit",
                        children: "Habit List"
                    }, void 0, false, {
                        fileName: "[project]/src/app/add-habit/page.tsx",
                        lineNumber: 164,
                        columnNumber: 11
                    }, this)
                }, void 0, false, {
                    fileName: "[project]/src/app/add-habit/page.tsx",
                    lineNumber: 163,
                    columnNumber: 9
                }, this)
            ]
        }, void 0, true, {
            fileName: "[project]/src/app/add-habit/page.tsx",
            lineNumber: 88,
            columnNumber: 7
        }, this)
    }, void 0, false, {
        fileName: "[project]/src/app/add-habit/page.tsx",
        lineNumber: 87,
        columnNumber: 5
    }, this);
}
_s(AddHabits, "k0fTWxTCm979uujaaFPGeNcDkT8=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRouter"]
    ];
});
_c = AddHabits;
var _c;
__turbopack_refresh__.register(_c, "AddHabits");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_refresh__.registerExports(module, globalThis.$RefreshHelpers$);
}
}}),
"[project]/src/app/add-habit/page.tsx [app-rsc] (ecmascript, Next.js server component, client modules)": ((__turbopack_context__) => {

var { r: __turbopack_require__, f: __turbopack_module_context__, i: __turbopack_import__, s: __turbopack_esm__, v: __turbopack_export_value__, n: __turbopack_export_namespace__, c: __turbopack_cache__, M: __turbopack_modules__, l: __turbopack_load__, j: __turbopack_dynamic__, P: __turbopack_resolve_absolute_path__, U: __turbopack_relative_url__, R: __turbopack_resolve_module_id_path__, b: __turbopack_worker_blob_url__, g: global, __dirname, t: __turbopack_require_real__ } = __turbopack_context__;
{
}}),
}]);

//# sourceMappingURL=src_app_add-habit_page_tsx_abd6be._.js.map